import { useRef, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { rangeToMultiplier } from "@/components/OscillatorBank/audio/baseOscillator";
import {
  createPinkNoiseGenerator,
  createRedNoiseGenerator,
  calculateLfoValue,
  updateEnvelopeState,
  mixModulationSources,
} from "./utils/modulationUtils";
import type { ModulationState, NoiseGenerators } from "./utils/types";

export function useModulationSources() {
  const noiseGeneratorsRef = useRef<NoiseGenerators>({
    pink: createPinkNoiseGenerator(),
    red: createRedNoiseGenerator(),
  });

  const envelopeStateRef = useRef<ModulationState["envelope"]>({
    isGateOn: false,
    stage: "idle",
    value: 0,
    lastTime: 0,
  });

  const {
    lfoRate,
    lfoWaveform,
    modMix,
    osc3FilterEgSwitch,
    noiseLfoSwitch,
    filterAttack,
    filterDecay,
    filterSustain,
    decaySwitchOn,
    mixer,
    activeKeys,
    oscillator3,
  } = useSynthStore();

  const getModulationSignal = useCallback(
    (time: number): number => {
      const lfoFrequency = lfoRate ? 0.2 * Math.pow(100, lfoRate / 10) : 0.2;

      // Source 1: Either Oscillator 3 or Filter EG
      const source1 = osc3FilterEgSwitch
        ? updateEnvelopeState(
            envelopeStateRef.current,
            activeKeys !== null,
            time,
            Math.max(0.001, (filterAttack / 10) * 1.0),
            Math.max(0.001, (filterDecay / 10) * 1.5),
            Math.max(0, Math.min(1, filterSustain / 10)),
            decaySwitchOn
          )
        : (() => {
            // Use actual Oscillator 3 waveform for modulation
            const baseFreq = 5; // Lower frequency for more audible effect
            const rangeMultiplier = rangeToMultiplier[oscillator3.range] || 1;
            const modulationFreq = baseFreq * rangeMultiplier;
            const phase = (modulationFreq * time) % 1;

            // Generate the actual oscillator waveform
            let result;
            switch (oscillator3.waveform) {
              case "sawtooth":
                // Sawtooth: linear ramp from -1 to 1
                result = 2 * phase - 1;
                break;
              case "square":
              case "pulse1":
                // Square: instant jumps between -1 and 1
                result = phase < 0.5 ? 1 : -1;
                break;
              case "pulse2":
                // Wide pulse: mostly high with brief dips
                result = phase < 0.8 ? 1 : -1;
                break;
              case "pulse3":
                // Narrow pulse: mostly low with brief spikes
                result = phase < 0.2 ? 1 : -1;
                break;
              case "triangle":
              default:
                // Triangle: smooth and symmetrical
                result = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
                break;
            }

            return result;
          })();

      // Source 2: Either Noise or LFO
      const source2 = noiseLfoSwitch
        ? calculateLfoValue(time, lfoFrequency, lfoWaveform)
        : mixer?.noise?.noiseType === "white"
        ? noiseGeneratorsRef.current.pink()
        : noiseGeneratorsRef.current.red();

      // Mix the two sources according to the modulation mix setting
      // This creates the authentic Minimoog modulation behavior where
      // both sources can work together or individually
      return mixModulationSources(source1, source2, modMix || 0);
    },
    [
      lfoRate,
      lfoWaveform,
      modMix,
      osc3FilterEgSwitch,
      noiseLfoSwitch,
      filterAttack,
      filterDecay,
      filterSustain,
      decaySwitchOn,
      mixer?.noise?.noiseType,
      activeKeys,
      oscillator3.range,
      oscillator3.waveform,
    ]
  );

  return { getModulationSignal };
}
