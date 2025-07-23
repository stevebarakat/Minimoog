import { useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { resetGain } from "@/utils/audioUtils";

export function useExternalInput(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode
) {
  const gainRef = useRef<GainNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Subscribe to the mixer external state
  const mixerExternal = useSynthStore((state) => state.mixer.external);

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    const normalizedVolume = linearVolume / 10;
    return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
  };

  // Simple audio level monitoring - only when enabled
  useEffect(() => {
    if (!mixerExternal.enabled || !analyzerRef.current) {
      setAudioLevel(0);
      return;
    }

    const updateLevel = () => {
      try {
        const dataArray = new Uint8Array(
          analyzerRef.current!.frequencyBinCount
        );
        analyzerRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(1, average / 50);
        const volumeFactor = linearToLogGain(mixerExternal.volume);
        const adjustedLevel = normalizedLevel * (1 + volumeFactor);
        setAudioLevel(adjustedLevel);
      } catch {
        setAudioLevel(0);
      }
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [mixerExternal.enabled, mixerExternal.volume]);

  // Main effect: handle enable/disable and volume changes
  useEffect(() => {
    if (!audioContext) return;

    const cleanup = () => {
      // Stop audio level monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      // Disconnect and cleanup gain node
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }

      // Disconnect and cleanup input
      if (inputRef.current) {
        inputRef.current.disconnect();
        inputRef.current = null;
      }

      // Disconnect and cleanup analyzer
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
        analyzerRef.current = null;
      }

      // Stop and cleanup stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setAudioLevel(0);
    };

    if (!mixerExternal.enabled) {
      cleanup();
      return;
    }

    // ENABLED: Set up audio nodes
    const setupAudio = async () => {
      try {
        // Create gain node
        if (!gainRef.current) {
          gainRef.current = audioContext.createGain();
        }

        // Set gain based on volume
        const newGain = linearToLogGain(mixerExternal.volume);
        resetGain(gainRef.current, newGain, audioContext);

        // Create analyzer node
        if (!analyzerRef.current) {
          analyzerRef.current = audioContext.createAnalyser();
          analyzerRef.current.fftSize = 256;
        }

        // Request microphone access if needed
        if (!inputRef.current && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          inputRef.current = audioContext.createMediaStreamSource(stream);

          // Connect input to gain and analyzer
          inputRef.current.connect(gainRef.current);
          inputRef.current.connect(analyzerRef.current);
          analyzerRef.current.connect(audioContext.destination);
        }

        // Connect gain to mixer
        if (gainRef.current) {
          if (mixerNode) {
            gainRef.current.connect(mixerNode);
          } else {
            gainRef.current.connect(audioContext.destination);
          }
        }
      } catch (error) {
        console.warn("Failed to setup external input:", error);
        cleanup();
      }
    };

    setupAudio();

    return cleanup;
  }, [mixerExternal.enabled, mixerExternal.volume, audioContext, mixerNode]);

  return { audioLevel };
}
