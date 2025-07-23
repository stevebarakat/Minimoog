import { useEffect, useRef, useState, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { resetGain, disconnectNode } from "@/utils/audioUtils";

export function useExternalInput(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode
) {
  const gainRef = useRef<GainNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isConnectedRef = useRef(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const updateAudioLevelRef = useRef<(() => void) | null>(null);
  const keepAliveRef = useRef<OscillatorNode | null>(null);

  // Subscribe to the mixer external state
  const mixerExternal = useSynthStore((state) => state.mixer.external);

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    const normalizedVolume = linearVolume / 10;
    return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
  };

  // Audio level monitoring
  const updateAudioLevel = useCallback(() => {
    if (!analyzerRef.current) {
      if (updateAudioLevelRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      }
      return;
    }
    try {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const latestState = useSynthStore.getState().mixer.external;
      if (latestState.enabled) {
        const normalizedLevel = Math.min(1, average / 50);
        const volumeFactor = linearToLogGain(latestState.volume);
        const adjustedLevel = normalizedLevel * (1 + volumeFactor);
        setAudioLevel(adjustedLevel);
      } else {
        setAudioLevel(0);
      }
    } catch {
      setAudioLevel(0);
    }
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);
  updateAudioLevelRef.current = updateAudioLevel;

  // Effect: Only set up microphone and nodes when enabled, and clean up on disable/unmount
  useEffect(() => {
    if (!audioContext) return;
    let cancelled = false;

    async function setupExternalInput() {
      // Helper to disconnect gain node from all outputs
      function disconnectGain() {
        if (gainRef.current) {
          try {
            gainRef.current.disconnect();
          } catch {
            /* ignore disconnect errors */
          }
        }
        isConnectedRef.current = false;
      }

      if (!mixerExternal.enabled) {
        // If disabled, ensure everything is cleaned up
        disconnectGain();
        if (gainRef.current) {
          disconnectNode(gainRef.current);
          gainRef.current = null;
        }
        if (inputRef.current) {
          inputRef.current.disconnect();
          inputRef.current = null;
        }
        if (analyzerRef.current) {
          analyzerRef.current.disconnect();
          analyzerRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        if (keepAliveRef.current) {
          keepAliveRef.current.stop();
          disconnectNode(keepAliveRef.current);
          keepAliveRef.current = null;
        }
        setAudioLevel(0);
        return;
      }

      // ENABLED: set up nodes and request microphone
      try {
        // Create gain node if needed
        if (!gainRef.current && audioContext) {
          gainRef.current = audioContext.createGain();
        }
        // Always set gain value on every volume change
        if (gainRef.current && audioContext) {
          const newGain = linearToLogGain(mixerExternal.volume);
          resetGain(gainRef.current, newGain, audioContext);
        }

        // Create analyzer node if needed
        if (!analyzerRef.current && audioContext) {
          analyzerRef.current = audioContext.createAnalyser();
          analyzerRef.current.fftSize = 256;
        }

        // Request microphone access if needed
        if (
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia &&
          !inputRef.current &&
          audioContext
        ) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          if (cancelled) return;
          inputRef.current = audioContext.createMediaStreamSource(stream);

          // Analyzer gain node (for level monitoring)
          const analyzerGain = audioContext.createGain();
          analyzerGain.gain.setValueAtTime(1, audioContext.currentTime);
          inputRef.current.connect(gainRef.current!);
          inputRef.current.connect(analyzerGain);
          analyzerGain.connect(analyzerRef.current!);
          analyzerRef.current!.connect(audioContext.destination);
        }

        // Keep-alive oscillator for mixer
        if (!keepAliveRef.current && audioContext) {
          keepAliveRef.current = audioContext.createOscillator();
          keepAliveRef.current.frequency.setValueAtTime(
            1,
            audioContext.currentTime
          );
          keepAliveRef.current.type = "sine";
          const silentGain = audioContext.createGain();
          silentGain.gain.setValueAtTime(0, audioContext.currentTime);
          keepAliveRef.current.connect(silentGain);
          silentGain.connect(mixerNode || audioContext.destination);
          keepAliveRef.current.start();
        }

        // Always disconnect gain node before reconnecting
        disconnectGain();
        // Connect gain node to only one output
        if (gainRef.current) {
          if (mixerNode) {
            gainRef.current.connect(mixerNode);
          } else if (audioContext) {
            gainRef.current.connect(audioContext.destination);
          }
          isConnectedRef.current = true;
        }

        // Start audio level monitoring
        if (updateAudioLevelRef.current) {
          updateAudioLevelRef.current();
        }
      } catch {
        // Clean up on error
        disconnectGain();
        if (gainRef.current) {
          disconnectNode(gainRef.current);
          gainRef.current = null;
        }
        if (inputRef.current) {
          inputRef.current.disconnect();
          inputRef.current = null;
        }
        if (analyzerRef.current) {
          analyzerRef.current.disconnect();
          analyzerRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        if (keepAliveRef.current) {
          keepAliveRef.current.stop();
          disconnectNode(keepAliveRef.current);
          keepAliveRef.current = null;
        }
        setAudioLevel(0);
      }
    }

    setupExternalInput();
    return () => {
      cancelled = true;
      // Always clean up on unmount or disable
      if (gainRef.current) {
        try {
          gainRef.current.disconnect();
        } catch {
          /* ignore disconnect errors */
        }
        disconnectNode(gainRef.current);
        gainRef.current = null;
      }
      if (inputRef.current) {
        inputRef.current.disconnect();
        inputRef.current = null;
      }
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
        analyzerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      if (keepAliveRef.current) {
        keepAliveRef.current.stop();
        disconnectNode(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      isConnectedRef.current = false;
      setAudioLevel(0);
    };
  }, [mixerExternal.enabled, mixerExternal.volume, audioContext, mixerNode]);

  return { audioLevel };
}
