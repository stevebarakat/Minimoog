import { useRef, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { SYNTH_CONFIG } from "@/config";

type OscillatorWithNode = {
  getNode?: () => OscillatorNode | null;
};

type UseVibratoEffectProps = {
  audioContext: AudioContext | null;
  lfoNode: OscillatorNode | null;
  osc1: OscillatorWithNode | null;
  osc2: OscillatorWithNode | null;
  osc3: OscillatorWithNode | null;
};

export function useVibratoEffect({
  audioContext,
  lfoNode,
  osc1,
  osc2,
  osc3,
}: UseVibratoEffectProps) {
  const vibratoDepthGainsRef = useRef<{
    osc1: GainNode | null;
    osc2: GainNode | null;
    osc3: GainNode | null;
  }>({
    osc1: null,
    osc2: null,
    osc3: null,
  });

  const { oscillatorModulationOn, modWheel, noiseLfoSwitch, modMix } =
    useSynthStore();

  useEffect(() => {
    const safeModWheel = modWheel || 0;

    if (!audioContext || !oscillatorModulationOn || safeModWheel === 0) {
      return;
    }

    const cleanup = () => {
      (
        Object.keys(vibratoDepthGainsRef.current) as Array<
          keyof typeof vibratoDepthGainsRef.current
        >
      ).forEach((k) => {
        const g = vibratoDepthGainsRef.current[k];
        if (g) {
          try {
            g.disconnect();
          } catch {
            // Ignore disconnect errors
          }
          vibratoDepthGainsRef.current[k] = null;
        }
      });
    };

    cleanup();

    try {
      const lfoSelected = noiseLfoSwitch === true;
      const mix = Math.max(0, Math.min(1, (modMix ?? 0) / 10));

      if (lfoSelected && lfoNode && mix > 0) {
        const maxCents = 120;
        const depthCents =
          (safeModWheel / SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.MAX) *
          maxCents *
          mix;

        const ensureDepthGain = (key: "osc1" | "osc2" | "osc3") => {
          if (!vibratoDepthGainsRef.current[key]) {
            vibratoDepthGainsRef.current[key] = audioContext.createGain();
            lfoNode.connect(vibratoDepthGainsRef.current[key]!);
          }
          vibratoDepthGainsRef.current[key]!.gain.setValueAtTime(
            depthCents,
            audioContext.currentTime
          );
        };

        const connectDetune = (
          node: OscillatorNode | null,
          key: "osc1" | "osc2" | "osc3"
        ) => {
          if (!node) return;
          ensureDepthGain(key);
          try {
            vibratoDepthGainsRef.current[key]!.connect(node.detune);
          } catch {
            // Ignore detune connection errors
          }
        };

        connectDetune(
          osc1?.getNode ? (osc1.getNode() as OscillatorNode) : null,
          "osc1"
        );
        connectDetune(
          osc2?.getNode ? (osc2.getNode() as OscillatorNode) : null,
          "osc2"
        );
        connectDetune(
          osc3?.getNode ? (osc3.getNode() as OscillatorNode) : null,
          "osc3"
        );
      }
    } catch {
      // Ignore vibrato setup errors
    }

    return cleanup;
  }, [
    audioContext,
    oscillatorModulationOn,
    modWheel,
    noiseLfoSwitch,
    modMix,
    lfoNode,
    osc1,
    osc2,
    osc3,
  ]);
}
