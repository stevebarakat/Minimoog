import { useCallback, useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  disconnectNode,
  getPooledNode,
  getPooledWorkletNode,
  releaseNode,
} from "@/utils";

export function useExternalInput(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode | null
) {
  const { mixer } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);
  const overloadMeterRef = useRef<AudioWorkletNode | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | GainNode | null>(
    null
  );
  const isConnectedRef = useRef(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isOverloaded, setIsOverloaded] = useState(false);

  // Setup microphone when external input is enabled
  const setupMicrophone = useCallback(async () => {
    if (!audioContext) return;

    // Don't recreate if already exists
    if (audioInputRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Create audio source from microphone stream
      audioInputRef.current = audioContext.createMediaStreamSource(stream);

      // Connect microphone to gain node
      if (gainRef.current) {
        audioInputRef.current.connect(gainRef.current);
      }
    } catch (error) {
      console.error("Failed to access microphone:", error);

      // In development, create a silent oscillator as fallback for testing
      if (process.env.NODE_ENV === "development") {
        const oscillator = getPooledNode(
          "oscillator",
          audioContext
        ) as OscillatorNode;
        const gain = getPooledNode("gain", audioContext) as GainNode;
        gain.gain.value = 0.1; // Small volume for testing
        oscillator.frequency.value = 440;
        oscillator.connect(gain);
        if (gainRef.current) {
          gain.connect(gainRef.current);
        }
        oscillator.start();

        // Store reference for cleanup
        audioInputRef.current = gain as unknown as MediaStreamAudioSourceNode;
      }
    }
  }, [audioContext]);

  // Core audio setup effect - only when audioContext changes
  useEffect(() => {
    if (!audioContext) {
      gainRef.current = null;
      overloadMeterRef.current = null;
      audioInputRef.current = null;
      isConnectedRef.current = false;
      return;
    }
    let cancelled = false;

    async function setup() {
      if (!audioContext) return;

      // Skip audio worklet setup in test environment
      if (process.env.NODE_ENV === "test") {
        console.warn("Skipping audio worklet setup in test environment");
        return;
      }

      try {
        await audioContext.audioWorklet.addModule(
          "/audio/audio-processors/overload-meter-processor.js"
        );
        if (cancelled) return;

        // Only create nodes if they don't exist
        if (!gainRef.current) {
          gainRef.current = getPooledNode("gain", audioContext) as GainNode;
        }

        // Set the gain value
        const initialGain = mixer.external.volume / 10;
        const finalGain = isFinite(initialGain) ? initialGain : 0;

        gainRef.current.gain.setValueAtTime(
          finalGain,
          audioContext.currentTime
        );

        if (!overloadMeterRef.current) {
          overloadMeterRef.current = getPooledWorkletNode(
            audioContext,
            "overload-meter-processor"
          );
          // Connect overload meter to the output of the gain node to monitor the final signal
          gainRef.current.connect(overloadMeterRef.current);

          // Set up overload monitoring
          if (overloadMeterRef.current) {
            overloadMeterRef.current.port.onmessage = (event) => {
              if (event.data.overload !== undefined && !event.data.debug) {
                setIsOverloaded(event.data.overload);
              }
              if (event.data.level !== undefined) {
                setAudioLevel(event.data.level);
              }
            };
          }
        }
      } catch (error) {
        // Handle errors gracefully, especially in test environment
        if (process.env.NODE_ENV === "test") {
          console.warn(
            "Audio worklet setup failed in test environment:",
            error
          );
        } else {
          console.error("Failed to setup external input audio worklet:", error);
        }
      }
    }

    // Handle the async setup properly
    setup().catch((error) => {
      // Handle any unhandled promise rejections
      if (process.env.NODE_ENV === "test") {
        console.warn(
          "Audio worklet setup promise rejected in test environment:",
          error
        );
      } else {
        console.error("Audio worklet setup promise rejected:", error);
      }
    });

    return () => {
      cancelled = true;
      if (gainRef.current) {
        releaseNode(gainRef.current);
        gainRef.current = null;
      }
      if (overloadMeterRef.current) {
        releaseNode(overloadMeterRef.current);
        overloadMeterRef.current = null;
      }
      if (audioInputRef.current) {
        audioInputRef.current.disconnect();
        audioInputRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [audioContext, mixer.external.volume]);

  // Handle connection/disconnection based on enabled state
  useEffect(() => {
    if (!gainRef.current || !audioContext) return;

    if (mixer.external.enabled && !isConnectedRef.current) {
      // Setup microphone when enabling external input
      setupMicrophone().then(() => {
        // Only connect to audio graph after microphone is set up
        if (mixerNode) {
          // Connect overload meter to mixer (overload meter is already connected to gain output)
          if (overloadMeterRef.current) {
            overloadMeterRef.current.connect(mixerNode);
          } else {
            gainRef.current!.connect(mixerNode);
          }
        } else {
          if (overloadMeterRef.current) {
            overloadMeterRef.current.connect(audioContext.destination);
          } else {
            gainRef.current!.connect(audioContext.destination);
          }
        }

        isConnectedRef.current = true;
      });
    } else if (!mixer.external.enabled && isConnectedRef.current) {
      // Disconnect from audio graph
      if (overloadMeterRef.current) {
        disconnectNode(overloadMeterRef.current);
      } else {
        disconnectNode(gainRef.current);
      }
      isConnectedRef.current = false;
    }
  }, [mixer.external.enabled, mixerNode, audioContext, setupMicrophone]);

  // Volume control effect
  useEffect(() => {
    if (gainRef.current && audioContext) {
      const newGain = mixer.external.volume / 10;
      const finalGain = isFinite(newGain) ? newGain : 0;

      // Directly set the gain value
      gainRef.current.gain.setValueAtTime(finalGain, audioContext.currentTime);
    }
  }, [mixer.external.volume, audioContext]);

  // Connect microphone to gain node when both are ready
  useEffect(() => {
    if (audioInputRef.current && gainRef.current && !isConnectedRef.current) {
      audioInputRef.current.connect(gainRef.current);
    }
  }, []);

  return {
    audioLevel,
    isOverloaded,
  };
}
