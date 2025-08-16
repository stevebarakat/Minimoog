import { useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  copyURLToClipboard,
  saveStateToURL,
  type PersistentSynthState,
} from "@/utils/urlUtils";
import { useToast } from "@/components/Toast/hooks/useToast";

export function useCopySettings() {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const showToast = useToast();

  // Get synth state from store
  const oscillator1 = useSynthStore((state) => state.oscillator1);
  const oscillator2 = useSynthStore((state) => state.oscillator2);
  const oscillator3 = useSynthStore((state) => state.oscillator3);
  const mixer = useSynthStore((state) => state.mixer);
  const filterCutoff = useSynthStore((state) => state.filterCutoff);
  const filterEmphasis = useSynthStore((state) => state.filterEmphasis);
  const filterContourAmount = useSynthStore(
    (state) => state.filterContourAmount
  );
  const filterAttack = useSynthStore((state) => state.filterAttack);
  const filterDecay = useSynthStore((state) => state.filterDecay);
  const filterSustain = useSynthStore((state) => state.filterSustain);
  const filterModulationOn = useSynthStore((state) => state.filterModulationOn);
  const keyboardControl1 = useSynthStore((state) => state.keyboardControl1);
  const keyboardControl2 = useSynthStore((state) => state.keyboardControl2);
  const oscillatorModulationOn = useSynthStore(
    (state) => state.oscillatorModulationOn
  );
  const lfoWaveform = useSynthStore((state) => state.lfoWaveform);
  const lfoRate = useSynthStore((state) => state.lfoRate);
  const osc3Control = useSynthStore((state) => state.osc3Control);
  const modMix = useSynthStore((state) => state.modMix);
  const osc3FilterEgSwitch = useSynthStore((state) => state.osc3FilterEgSwitch);
  const noiseLfoSwitch = useSynthStore((state) => state.noiseLfoSwitch);
  const loudnessAttack = useSynthStore((state) => state.loudnessAttack);
  const loudnessDecay = useSynthStore((state) => state.loudnessDecay);
  const loudnessSustain = useSynthStore((state) => state.loudnessSustain);
  const decaySwitchOn = useSynthStore((state) => state.decaySwitchOn);
  const glideOn = useSynthStore((state) => state.glideOn);
  const glideTime = useSynthStore((state) => state.glideTime);
  const masterTune = useSynthStore((state) => state.masterTune);
  const pitchWheel = useSynthStore((state) => state.pitchWheel);
  const modWheel = useSynthStore((state) => state.modWheel);
  const mainVolume = useSynthStore((state) => state.mainVolume);
  const isMainActive = useSynthStore((state) => state.isMainActive);
  const tunerOn = useSynthStore((state) => state.tunerOn);
  const auxOutput = useSynthStore((state) => state.auxOutput);

  const handleCopyURL = async () => {
    try {
      // Reconstruct synth state for URL operations
      const synthState: PersistentSynthState = {
        filterType: useSynthStore.getState().filterType,
        oscillator1,
        oscillator2,
        oscillator3,
        mixer,
        filterCutoff,
        filterEmphasis,
        filterContourAmount,
        filterAttack,
        filterDecay,
        filterSustain,
        filterModulationOn,
        keyboardControl1,
        keyboardControl2,
        oscillatorModulationOn,
        lfoWaveform,
        lfoRate,
        osc3Control,
        modMix,
        osc3FilterEgSwitch,
        noiseLfoSwitch,
        loudnessAttack,
        loudnessDecay,
        loudnessSustain,
        decaySwitchOn,
        glideOn,
        glideTime,
        masterTune,
        pitchWheel,
        modWheel,
        mainVolume,
        isMainActive,
        tunerOn,
        auxOutput,
      };

      await copyURLToClipboard(synthState);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);

      // Navigate to the copied URL without page refresh
      const params = saveStateToURL(synthState);
      const url = `${window.location.origin}${window.location.pathname}?${params}`;
      window.history.pushState({}, "", url);
    } catch {
      const msg = "Failed to copy preset URL. Please try again.";
      showToast({ title: "Preset Error", description: msg, variant: "error" });
    }
  };

  return {
    showCopiedMessage,
    handleCopyURL,
  };
}
