import { useRef, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapOscillatorType } from "../utils/synthUtils";
import type { ModulationProps } from "../types/synthTypes";

function useModulation({
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
    lfoNodeRef.current?.disconnect();
    lfoGainRef.current?.disconnect();
    lfoNodeRef.current = null;
    lfoGainRef.current = null;

    // Create new LFO
    const lfo = audioContext.createOscillator();
    lfo.type = lfoWaveform;
    const minHz = 0.1;
    const maxHz = 20;
    lfo.frequency.value = minHz * Math.pow(maxHz / minHz, lfoRate / 10);
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 1;
    lfo.connect(lfoGain);
    lfo.start();
    lfoNodeRef.current = lfo;
    lfoGainRef.current = lfoGain;

    return () => {
      lfo.stop();
      lfo.disconnect();
      lfoGain.disconnect();
    };
  }, [audioContext, lfoRate, lfoWaveform]);

  // Modulation sources setup
  useEffect(() => {
    if (!audioContext) return;

    // Clean up ALL previous modulation nodes when audio context changes
    const cleanupAllNodes = () => {
      // Stop and disconnect LFO
      lfoNodeRef.current?.stop();
      lfoNodeRef.current?.disconnect();
      lfoGainRef.current?.disconnect();
      lfoNodeRef.current = null;
      lfoGainRef.current = null;

      // Stop and disconnect modulation oscillators
      modOsc3Ref.current?.stop();
      modOsc3Ref.current?.disconnect();
      modOsc3Ref.current = null;

      // Stop and disconnect noise
      modNoiseRef.current?.stop();
      modNoiseRef.current?.disconnect();
      modNoiseRef.current = null;

      // Disconnect all gain nodes
      modEnvelopeGainRef.current?.disconnect();
      modLeftGainRef.current?.disconnect();
      modRightGainRef.current?.disconnect();
      modSumGainRef.current?.disconnect();
      modWheelGainRef.current?.disconnect();
      modOsc1GainRef.current?.disconnect();
      modOsc2GainRef.current?.disconnect();
      modOsc3GainRef.current?.disconnect();

      // Disconnect modulation monitor worklet
      modMonitorWorkletRef.current?.disconnect();
      modMonitorWorkletRef.current = null;

      // Clear all references
      modEnvelopeGainRef.current = null;
      modLeftGainRef.current = null;
      modRightGainRef.current = null;
      modSumGainRef.current = null;
      modWheelGainRef.current = null;
      modOsc1GainRef.current = null;
      modOsc2GainRef.current = null;
      modOsc3GainRef.current = null;

      // Clear buffer reference (will be recreated)
      modNoiseBufferRef.current = null;
    };

    // Always clean up first to ensure we start fresh
    cleanupAllNodes();

    // Create modulation-only OSC3
    const osc = audioContext.createOscillator();
    osc.type = mapOscillatorType(osc3State.waveform);
    osc.frequency.value = osc3Control ? 440 : 6;
    osc.start();
    modOsc3Ref.current = osc;

    // Create modulation-only Noise
    const bufferSize = audioContext.sampleRate * 2;
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
    modEnvelopeGainRef.current = audioContext.createGain();
    modEnvelopeGainRef.current.gain.value = 0;

    modLeftGainRef.current = audioContext.createGain();
    modRightGainRef.current = audioContext.createGain();
    modSumGainRef.current = audioContext.createGain();
    modWheelGainRef.current = audioContext.createGain();

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
    const mix = modMix / 10;
    const depth = 5;
    modLeftGainRef.current.gain.value = (1 - mix) * depth;
    modRightGainRef.current.gain.value = mix * depth;

    // Connect modulation chain
    modLeftGainRef.current.connect(modSumGainRef.current);
    modRightGainRef.current.connect(modSumGainRef.current);
    modSumGainRef.current.connect(modWheelGainRef.current);
    modWheelGainRef.current.gain.value = modWheel / 100;

    // Route to destinations
    if (oscillatorModulationOn && audioContext && modWheelGainRef.current) {
      [osc1, osc2, osc3].forEach((osc, index) => {
        const node = osc?.getNode?.();
        if (node && node.context === audioContext) {
          // Ensure node belongs to current context
          const modGain = audioContext.createGain();
          if (index === 0) modOsc1GainRef.current = modGain;
          else if (index === 1) modOsc2GainRef.current = modGain;
          else if (index === 2) modOsc3GainRef.current = modGain;

          const baseFreq = node.frequency.value || 440;
          modGain.gain.value = baseFreq * 0.0595 * (modWheel / 100);

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
        silentGain.gain.value = 0;
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
export default useModulation;
