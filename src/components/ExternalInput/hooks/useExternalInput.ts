import { useCallback, useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";

export function useExternalInput(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode
) {
  const { mixer } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isConnectedRef = useRef(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Use refs to access latest mixer state without creating dependencies
  const mixerRef = useRef(mixer);
  mixerRef.current = mixer;

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    // Convert 0-10 to 0-1
    const normalizedVolume = linearVolume / 10;
    // Convert to logarithmic scale with more usable gain values
    // At volume 0.001: gain ≈ 0.001 (-60dB)
    // At volume 1: gain ≈ 0.1 (-20dB)
    // At volume 5: gain ≈ 0.5 (-6dB)
    // At volume 10: gain = 1.0 (0dB)
    return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
  };

  const updateAudioLevel = useCallback(() => {
    if (!analyzerRef.current) return;

    // Use ref to get latest mixer state
    const currentMixer = mixerRef.current;

    // Only calculate level if external input is enabled and volume is above 0
    if (currentMixer.external.enabled && currentMixer.external.volume > 0) {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Convert to dB scale (assuming 0-255 maps to -60dB to 0dB)
      const dbLevel = 20 * Math.log10((average + 1) / 256);
      // Normalize to 0-1 range, where 0dB is 1 and -60dB is 0
      const normalizedLevel = Math.max(0, Math.min(1, (dbLevel + 60) / 60));

      // Adjust sensitivity based on volume setting
      const volumeFactor = linearToLogGain(currentMixer.external.volume);
      const adjustedLevel = normalizedLevel * (1 + volumeFactor);

      setAudioLevel(adjustedLevel);
    } else {
      setAudioLevel(0);
    }

    // Schedule next update
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []); // No dependencies needed since we use refs

  // Setup audio nodes and request microphone access
  useEffect(() => {
    async function setup() {
      console.log("Setting up external input audio nodes");
      if (!audioContext || audioContext.state !== "running") {
        console.log("Audio context not ready:", audioContext?.state);
        return;
      }

      try {
        // Always create gain node if it doesn't exist
        if (!gainRef.current) {
          console.log("Creating gain node");
          gainRef.current = audioContext.createGain();
          gainRef.current.gain.value = 0; // Start muted
        }

        // Always create analyzer node if it doesn't exist
        if (!analyzerRef.current) {
          console.log("Creating analyzer node");
          analyzerRef.current = audioContext.createAnalyser();
          analyzerRef.current.fftSize = 256;
        }

        // Only request microphone access if we don't already have it
        if (
          !inputRef.current &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          console.log("Requesting microphone access");
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            console.log("Microphone access granted, creating source node");
            // Create new source node
            inputRef.current = audioContext.createMediaStreamSource(stream);

            // Connect the nodes internally
            inputRef.current.connect(gainRef.current);
            inputRef.current.connect(analyzerRef.current);
            console.log("Internal audio nodes connected");

            // Only connect to audio graph if external input is enabled
            const currentMixer = mixerRef.current;
            if (currentMixer.external.enabled && !isConnectedRef.current) {
              console.log("Connecting to mixer node");
              if (mixerNode) {
                gainRef.current.connect(mixerNode);
              } else {
                gainRef.current.connect(audioContext.destination);
              }
              isConnectedRef.current = true;
            }

            // Set initial gain based on mixer state
            const initialGain = currentMixer.external.enabled
              ? linearToLogGain(currentMixer.external.volume)
              : 0;
            console.log("Setting initial gain:", initialGain);
            gainRef.current.gain.setValueAtTime(
              initialGain,
              audioContext.currentTime
            );

            // Start the audio level animation
            console.log("Starting audio level monitoring");
            updateAudioLevel();
          } catch (err) {
            console.error("ExternalInput: Error accessing microphone:", err);
          }
        } else if (inputRef.current) {
          console.log("Microphone already available");
          // If we already have input, connect to audio graph if enabled
          const currentMixer = mixerRef.current;
          if (currentMixer.external.enabled && !isConnectedRef.current) {
            console.log("Connecting existing input to mixer node");
            if (mixerNode) {
              gainRef.current?.connect(mixerNode);
            } else {
              gainRef.current?.connect(audioContext.destination);
            }
            isConnectedRef.current = true;
          }
          updateAudioLevel();
        }
      } catch (err) {
        console.error("ExternalInput: Error in setup:", err);
      }
    }

    setup();

    return () => {
      console.log("Cleaning up external input audio nodes");
      // Clean up connections
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
      isConnectedRef.current = false;
    };
  }, [audioContext, mixerNode, updateAudioLevel]);

  // Handle connection/disconnection based on enabled state
  useEffect(() => {
    console.log(
      "External Input enabled state changed:",
      mixer.external.enabled
    );
    if (!gainRef.current || !audioContext) return;

    const currentMixer = mixerRef.current;
    if (currentMixer.external.enabled && !isConnectedRef.current) {
      console.log("Connecting external input to audio graph");
      // Connect to audio graph
      if (mixerNode) {
        gainRef.current.connect(mixerNode);
      } else {
        gainRef.current.connect(audioContext.destination);
      }
      isConnectedRef.current = true;
    } else if (!currentMixer.external.enabled && isConnectedRef.current) {
      console.log("Disconnecting external input from audio graph");
      // Disconnect from audio graph
      gainRef.current.disconnect();
      isConnectedRef.current = false;
    }
  }, [mixer.external.enabled, mixerNode, audioContext]);

  // Update gain when mixer settings change
  useEffect(() => {
    console.log(
      "Gain update effect triggered, enabled:",
      mixer.external.enabled,
      "volume:",
      mixer.external.volume
    );
    if (gainRef.current) {
      const currentMixer = mixerRef.current;
      const newGain = currentMixer.external.enabled
        ? linearToLogGain(currentMixer.external.volume)
        : 0;
      console.log(
        "Setting gain to:",
        newGain,
        "for enabled:",
        currentMixer.external.enabled,
        "volume:",
        currentMixer.external.volume
      );
      // Guard against NaN and non-finite values
      if (isFinite(newGain)) {
        gainRef.current.gain.setValueAtTime(
          newGain,
          audioContext?.currentTime ?? 0
        );
      } else {
        gainRef.current.gain.setValueAtTime(0, audioContext?.currentTime ?? 0);
      }
    } else {
      console.log("Gain node not available");
    }
  }, [mixer.external.enabled, mixer.external.volume, audioContext]);

  return { audioLevel };
}
