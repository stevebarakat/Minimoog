import { useRef, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapOscillatorType } from "../utils/synthUtils";
import type { ModulationProps } from "../types/synthTypes";
import { getPooledNode, releaseNode } from "@/utils";
import { AUDIO, MIDI, SYNTH_PARAMS } from "@/config";

export function useModulation({
  audioContext,
  osc1,
  osc2,
  osc3,
  filterNode,
}: ModulationProps) {
  const lfoNodeRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const modOsc3Ref = useRef<OscillatorNode | null>(null);
  const modNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const modNoiseBufferRef = useRef<AudioBuffer | null>(null);
  const modEnvelopeGainRef = useRef<GainNode | null>(null);
  const modLeftGainRef = useRef<GainNode | null>(null);
  const modRightGainRef = useRef<GainNode | null>(null);
  const modSumGainRef = useRef<GainNode | null>(null);
  const modWheelGainRef = useRef<GainNode | null>(null);
  const modOsc1GainRef = useRef<GainNode | null>(null);
  const modOsc2GainRef = useRef<GainNode | null>(null);
  const modOsc3GainRef = useRef<GainNode | null>(null);
  const modMonitorWorkletRef = useRef<AudioWorkletNode | null>(null);

  const {
    lfoRate,
    lfoWaveform,
    oscillator3: osc3State,
    osc3Control,
    osc3FilterEgSwitch,
    noiseLfoSwitch,
    modMix,
    modWheel,
    oscillatorModulationOn,
    filterModulationOn,
  } = useSynthStore();

  // LFO setup
  useEffect(() => {
    if (!audioContext) return;

    // Clean up previous LFO
    if (lfoNodeRef.current) {
      releaseNode(lfoNodeRef.current);
      lfoNodeRef.current = null;
    }
    if (lfoGainRef.current) {
      releaseNode(lfoGainRef.current);
      lfoGainRef.current = null;
    }

    // Create new LFO
    const lfo = getPooledNode("oscillator", audioContext) as OscillatorNode;
    lfo.type = lfoWaveform;
    const minHz = 0.1;
    const maxHz = 20;
    lfo.frequency.setValueAtTime(
      minHz * Math.pow(maxHz / minHz, lfoRate / 10),
      audioContext.currentTime
    );
    const lfoGain = getPooledNode("gain", audioContext) as GainNode;
    lfoGain.gain.setValueAtTime(1, audioContext.currentTime);
    lfo.connect(lfoGain);
    lfo.start();
    lfoNodeRef.current = lfo;
    lfoGainRef.current = lfoGain;

    return () => {
      if (lfoNodeRef.current) {
        releaseNode(lfoNodeRef.current);
        lfoNodeRef.current = null;
      }
      if (lfoGainRef.current) {
        releaseNode(lfoGainRef.current);
        lfoGainRef.current = null;
      }
    };
  }, [audioContext, lfoWaveform, lfoRate]);

  // Modulation sources setup
  useEffect(() => {
    if (!audioContext) return;

    // Clean up ALL previous modulation nodes when audio context changes
    const cleanupAllNodes = () => {
      if (lfoNodeRef.current) {
        releaseNode(lfoNodeRef.current);
        lfoNodeRef.current = null;
      }
      if (lfoGainRef.current) {
        releaseNode(lfoGainRef.current);
        lfoGainRef.current = null;
      }
      if (modOsc3Ref.current) {
        releaseNode(modOsc3Ref.current);
        modOsc3Ref.current = null;
      }
      if (modEnvelopeGainRef.current) {
        releaseNode(modEnvelopeGainRef.current);
        modEnvelopeGainRef.current = null;
      }
      if (modLeftGainRef.current) {
        releaseNode(modLeftGainRef.current);
        modLeftGainRef.current = null;
      }
      if (modRightGainRef.current) {
        releaseNode(modRightGainRef.current);
        modRightGainRef.current = null;
      }
      if (modSumGainRef.current) {
        releaseNode(modSumGainRef.current);
        modSumGainRef.current = null;
      }
      if (modWheelGainRef.current) {
        releaseNode(modWheelGainRef.current);
        modWheelGainRef.current = null;
      }
      if (modOsc1GainRef.current) {
        releaseNode(modOsc1GainRef.current);
        modOsc1GainRef.current = null;
      }
      if (modOsc2GainRef.current) {
        releaseNode(modOsc2GainRef.current);
        modOsc2GainRef.current = null;
      }
      if (modOsc3GainRef.current) {
        releaseNode(modOsc3GainRef.current);
        modOsc3GainRef.current = null;
      }
      // Buffer sources and worklets are not pooled
      modNoiseRef.current?.stop();
      modNoiseRef.current?.disconnect();
      modNoiseRef.current = null;
      modMonitorWorkletRef.current?.disconnect();
      modMonitorWorkletRef.current = null;
      modNoiseBufferRef.current = null;
    };

    // Always clean up first to ensure we start fresh
    cleanupAllNodes();

    // Create modulation-only OSC3
    const osc = getPooledNode("oscillator", audioContext) as OscillatorNode;
    osc.type = mapOscillatorType(osc3State.waveform);
    osc.frequency.setValueAtTime(
      osc3Control ? MIDI.A4_FREQUENCY : 6,
      audioContext.currentTime
    );
    osc.start();
    modOsc3Ref.current = osc;

    // Create modulation-only Noise
    const bufferSize =
      audioContext.sampleRate * AUDIO.MODULATION_BUFFER_SIZE_MULTIPLIER;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    modNoiseBufferRef.current = buffer;

    const noise = audioContext.createBufferSource();
    noise.buffer = modNoiseBufferRef.current;
    noise.loop = true;
    noise.start();
    modNoiseRef.current = noise;

    // Create modulation gains
    modEnvelopeGainRef.current = getPooledNode(
      "gain",
      audioContext
    ) as GainNode;
    modEnvelopeGainRef.current.gain.setValueAtTime(0, audioContext.currentTime);

    modLeftGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    modRightGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    modSumGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    modWheelGainRef.current = getPooledNode("gain", audioContext) as GainNode;

    // Connect selected sources
    if (osc3FilterEgSwitch) {
      if (modOsc3Ref.current)
        modOsc3Ref.current.connect(modLeftGainRef.current);
    } else {
      if (modEnvelopeGainRef.current)
        modEnvelopeGainRef.current.connect(modLeftGainRef.current);
    }
    if (noiseLfoSwitch) {
      if (modNoiseRef.current)
        modNoiseRef.current.connect(modRightGainRef.current);
    } else {
      if (lfoGainRef.current)
        lfoGainRef.current.connect(modRightGainRef.current);
    }

    // Set crossfade mix
    const mix = modMix / SYNTH_PARAMS.MOD_MIX.MAX;
    const depth = 5;
    modLeftGainRef.current.gain.setValueAtTime(
      (1 - mix) * depth,
      audioContext.currentTime
    );
    modRightGainRef.current.gain.setValueAtTime(
      mix * depth,
      audioContext.currentTime
    );

    // Connect modulation chain
    modLeftGainRef.current.connect(modSumGainRef.current);
    modRightGainRef.current.connect(modSumGainRef.current);
    modSumGainRef.current.connect(modWheelGainRef.current);
    modWheelGainRef.current.gain.setValueAtTime(
      modWheel / SYNTH_PARAMS.MOD_WHEEL.MAX,
      audioContext.currentTime
    );

    // Route to destinations
    if (oscillatorModulationOn && audioContext && modWheelGainRef.current) {
      [osc1, osc2, osc3].forEach((osc, index) => {
        const node = osc?.getNode?.();
        if (node && node.context === audioContext) {
          // Ensure node belongs to current context
          const modGain = getPooledNode("gain", audioContext) as GainNode;
          if (index === 0) modOsc1GainRef.current = modGain;
          else if (index === 1) modOsc2GainRef.current = modGain;
          else if (index === 2) modOsc3GainRef.current = modGain;

          const baseFreq = node.frequency.value || MIDI.A4_FREQUENCY;
          modGain.gain.setValueAtTime(
            baseFreq * 0.0595 * (modWheel / SYNTH_PARAMS.MOD_WHEEL.MAX),
            audioContext.currentTime
          );

          modWheelGainRef.current?.connect(modGain);
          modGain.connect(node.frequency);
        }
      });
    }

    // --- MODIFIED: Sample modulation output and send to filter worklet ---
    if (
      filterModulationOn &&
      filterNode &&
      filterNode instanceof AudioWorkletNode &&
      modWheelGainRef.current
    ) {
      // Use AudioWorkletNode to tap the modulation signal
      try {
        const modMonitorWorklet = new AudioWorkletNode(
          audioContext,
          "modulation-monitor-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          }
        );

        // Connect the modulation signal to the worklet
        modWheelGainRef.current.connect(modMonitorWorklet);

        // Connect worklet output to a silent gain to complete the audio graph
        const silentGain = audioContext.createGain();
        silentGain.gain.setValueAtTime(0, audioContext.currentTime);
        modMonitorWorklet.connect(silentGain);

        // Listen for modulation values from the worklet
        modMonitorWorklet.port.onmessage = (event) => {
          if (event.data.modValue !== undefined) {
            filterNode.port.postMessage({ modValue: event.data.modValue });
          }
        };

        modMonitorWorkletRef.current = modMonitorWorklet;
      } catch (error) {
        console.warn("Failed to create modulation monitor worklet:", error);
      }
    }

    return () => {
      cleanupAllNodes();
    };
  }, [
    audioContext,
    osc3State.waveform,
    osc3Control,
    osc3FilterEgSwitch,
    noiseLfoSwitch,
    modMix,
    modWheel,
    oscillatorModulationOn,
    filterModulationOn,
    osc1,
    osc2,
    osc3,
    filterNode,
    lfoGainRef,
  ]);

  return {
    modEnvelopeGain: modEnvelopeGainRef.current,
  };
}
