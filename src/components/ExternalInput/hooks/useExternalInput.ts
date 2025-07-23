import { useEffect, useRef, useState, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";

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
      // If analyzer is not available, try to restart monitoring
      if (updateAudioLevelRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      }
      return;
    }

    try {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Get the latest state from the store to avoid stale closures
      const latestState = useSynthStore.getState().mixer.external;

      // Only calculate level if external input is enabled
      if (latestState.enabled) {
        // More sensitive audio level calculation
        // Direct mapping from raw average (0-255) to 0-1 range
        // Scale to be more responsive to typical microphone levels
        const normalizedLevel = Math.min(1, average / 50); // 50 is a good threshold for typical speech

        // Adjust sensitivity based on volume setting
        const volumeFactor = linearToLogGain(latestState.volume);
        const adjustedLevel = normalizedLevel * (1 + volumeFactor);

        setAudioLevel(adjustedLevel);
      } else {
        setAudioLevel(0);
      }
    } catch (error) {
      // If there's an error, just set level to 0 and continue
      console.warn("Audio level monitoring error:", error);
      setAudioLevel(0);
    }

    // Always schedule next update, even if there are errors
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []); // No dependencies to avoid stale closures

  // Store the function in a ref so we can call it without dependencies
  updateAudioLevelRef.current = updateAudioLevel;

  // Basic audio setup - only runs once on mount
  useEffect(() => {
    if (!audioContext || audioContext.state !== "running") {
      return;
    }

    // Create audio nodes
    if (!gainRef.current) {
      gainRef.current = audioContext.createGain();
      gainRef.current.gain.setValueAtTime(0, audioContext.currentTime); // Start muted
    }

    if (!analyzerRef.current) {
      analyzerRef.current = audioContext.createAnalyser();
      analyzerRef.current.fftSize = 256;
    }

    // Request microphone access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          inputRef.current = audioContext.createMediaStreamSource(stream);

          // Create a separate gain node for the analyzer (always connected)
          const analyzerGain = audioContext.createGain();
          analyzerGain.gain.setValueAtTime(1, audioContext.currentTime); // Always at unity gain

          // Connect input to both gain nodes
          inputRef.current.connect(gainRef.current!);
          inputRef.current.connect(analyzerGain);

          // Connect analyzer gain to analyzer and then to destination
          analyzerGain.connect(analyzerRef.current!);
          analyzerRef.current!.connect(audioContext.destination);

          // Start audio level monitoring using the ref
          if (updateAudioLevelRef.current) {
            updateAudioLevelRef.current();
          }
        })
        .catch((err) => {
          console.error("ExternalInput: Error accessing microphone:", err);
        });
    }

    return () => {
      // Cleanup
      if (gainRef.current) {
        gainRef.current.disconnect();
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
      }
      if (keepAliveRef.current) {
        keepAliveRef.current.stop();
        keepAliveRef.current.disconnect();
        keepAliveRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [audioContext]); // No problematic dependencies

  // Control gain and connections based on enabled state and volume
  useEffect(() => {
    if (!gainRef.current || !audioContext) return;

    const newGain = mixerExternal.enabled
      ? linearToLogGain(mixerExternal.volume)
      : 0;

    // Update gain
    if (isFinite(newGain)) {
      gainRef.current.gain.setValueAtTime(newGain, audioContext.currentTime);
    }

    // Handle connections
    if (mixerExternal.enabled && !isConnectedRef.current) {
      // Create a silent oscillator to keep the mixer active
      if (!keepAliveRef.current) {
        keepAliveRef.current = audioContext.createOscillator();
        keepAliveRef.current.frequency.setValueAtTime(
          1,
          audioContext.currentTime
        ); // Very low frequency
        keepAliveRef.current.type = "sine";

        // Create a gain node to make it silent
        const silentGain = audioContext.createGain();
        silentGain.gain.setValueAtTime(0, audioContext.currentTime);

        keepAliveRef.current.connect(silentGain);
        silentGain.connect(mixerNode || audioContext.destination);
        keepAliveRef.current.start();
      }

      // Connect external input to mixer
      if (mixerNode) {
        gainRef.current.connect(mixerNode);
      } else {
        gainRef.current.connect(audioContext.destination);
      }
      isConnectedRef.current = true;
    } else if (!mixerExternal.enabled && isConnectedRef.current) {
      gainRef.current.disconnect();
      isConnectedRef.current = false;

      // Stop the keep-alive oscillator
      if (keepAliveRef.current) {
        keepAliveRef.current.stop();
        keepAliveRef.current.disconnect();
        keepAliveRef.current = null;
      }
    }
  }, [mixerExternal.enabled, mixerExternal.volume, audioContext, mixerNode]);

  // Monitor and restart audio level monitoring if it stops
  useEffect(() => {
    if (!mixerExternal.enabled || mixerExternal.volume === 0) return;

    const checkAndRestartMonitoring = () => {
      if (!animationFrameRef.current && updateAudioLevelRef.current) {
        updateAudioLevelRef.current();
      }
    };

    // Check every 100ms if monitoring is still running
    const interval = setInterval(checkAndRestartMonitoring, 100);

    return () => {
      clearInterval(interval);
    };
  }, [mixerExternal.enabled, mixerExternal.volume]);

  return { audioLevel };
}
