import { useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { resetGain, getPooledNode, releaseNode } from "@/utils";
import {
  EXTERNAL_INPUT,
  SYNTH_PARAMS,
  getExternalInputAnalyzerConfig,
} from "@/config";

export function useExternalInput(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode
) {
  const gainRef = useRef<GainNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const overloadMeterRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Subscribe to the mixer external state
  const mixerExternal = useSynthStore((state) => state.mixer.external);
  const setMixerExternal = useSynthStore((state) => state.setMixerExternal);

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    const normalizedVolume = linearVolume / SYNTH_PARAMS.VOLUME.MAX;
    return (
      Math.pow(
        normalizedVolume,
        EXTERNAL_INPUT.LEVEL_MONITORING.VOLUME_CURVE_POWER
      ) *
        EXTERNAL_INPUT.LEVEL_MONITORING.MAX_GAIN +
      EXTERNAL_INPUT.LEVEL_MONITORING.MIN_GAIN
    );
  };

  // Audio level monitoring - only when enabled
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
        const normalizedLevel = Math.min(
          1,
          average / EXTERNAL_INPUT.LEVEL_MONITORING.NORMALIZATION_FACTOR
        );
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

  // Overload monitoring from the overload meter processor
  useEffect(() => {
    if (!overloadMeterRef.current) return;

    const handleOverloadMessage = (event: MessageEvent) => {
      if (event.data.overload !== undefined && !event.data.debug) {
        setIsOverloaded(event.data.overload);
      }
    };

    overloadMeterRef.current.port.onmessage = handleOverloadMessage;

    return () => {
      if (overloadMeterRef.current) {
        overloadMeterRef.current.port.onmessage = null;
      }
    };
  }, [setMixerExternal]);

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
        releaseNode(gainRef.current);
        gainRef.current = null;
      }

      // Disconnect and cleanup input
      if (inputRef.current) {
        inputRef.current.disconnect();
        inputRef.current = null;
      }

      // Disconnect and cleanup analyzer
      if (analyzerRef.current) {
        releaseNode(analyzerRef.current);
        analyzerRef.current = null;
      }

      // Disconnect and cleanup overload meter
      if (overloadMeterRef.current) {
        overloadMeterRef.current.disconnect();
        overloadMeterRef.current = null;
      }

      // Stop and cleanup stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setAudioLevel(0);
      setIsOverloaded(false);
    };

    if (!mixerExternal.enabled) {
      cleanup();
      return;
    }

    // ENABLED: Set up audio nodes
    const setupAudio = async () => {
      try {
        // Load the overload meter processor only once
        await audioContext.audioWorklet.addModule(
          "/audio-processors/overload-meter-processor.js"
        );

        // Create gain node
        if (!gainRef.current) {
          gainRef.current = getPooledNode("gain", audioContext) as GainNode;
        }

        // Set gain based on volume
        const newGain = linearToLogGain(mixerExternal.volume);
        resetGain(gainRef.current, newGain, audioContext);

        // Create analyzer node
        if (!analyzerRef.current) {
          analyzerRef.current = getPooledNode(
            "analyser",
            audioContext
          ) as AnalyserNode;
          const analyzerConfig = getExternalInputAnalyzerConfig();
          analyzerRef.current.fftSize = analyzerConfig.fftSize;
        }

        // Create overload meter processor only once
        if (!overloadMeterRef.current) {
          overloadMeterRef.current = new AudioWorkletNode(
            audioContext,
            "overload-meter-processor",
            {
              numberOfInputs: 1,
              numberOfOutputs: 1,
              outputChannelCount: [1],
            }
          );
        }

        // Request microphone access if needed
        if (!inputRef.current && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          inputRef.current = audioContext.createMediaStreamSource(stream);

          // Connect input to gain, analyzer, and overload meter
          inputRef.current.connect(gainRef.current);
          inputRef.current.connect(analyzerRef.current);
          inputRef.current.connect(overloadMeterRef.current);

          // Connect analyzer and overload meter to destination (for monitoring)
          analyzerRef.current.connect(audioContext.destination);
          overloadMeterRef.current.connect(audioContext.destination);
        }

        // Connect gain to mixer
        if (gainRef.current) {
          if (mixerNode) {
            gainRef.current.connect(mixerNode);
          } else {
            gainRef.current.connect(audioContext.destination);
          }
        }
      } catch {
        cleanup();
      }
    };

    setupAudio();

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixerExternal.enabled, audioContext, mixerNode]);

  // Separate effect for volume changes
  useEffect(() => {
    if (gainRef.current && audioContext) {
      const newGain = linearToLogGain(mixerExternal.volume);
      resetGain(gainRef.current, newGain, audioContext);
    }
  }, [mixerExternal.volume, audioContext]);

  return { audioLevel, isOverloaded };
}
