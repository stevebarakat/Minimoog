import { useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { convertStateToPresetFormat } from "@/utils";
import { useToast } from "@/components/Toast/hooks/useToast";
import styles from "./SavePreset.module.css";

type SavePresetProps = {
  disabled?: boolean;
};

function SavePreset({ disabled = false }: SavePresetProps) {
  const showToast = useToast();

  const handleSavePreset = useCallback(async () => {
    try {
      // Get current synth state
      const currentState = useSynthStore.getState();

      // Generate a unique ID based on timestamp
      const timestamp = Date.now();
      const id = `custom-preset-${timestamp}`;

      // Convert state to preset format
      const preset = convertStateToPresetFormat(
        currentState,
        id,
        "Custom Preset",
        "Custom preset created from current state",
        "Custom"
      );

      // Convert to JavaScript object string with proper formatting
      const presetJs = `  {
    id: "${preset.id}",
    name: "${preset.name}",
    description: "${preset.description}",
    category: "${preset.category}",
    controllers: {
      tune: ${preset.controllers.tune},
      glideTime: ${preset.controllers.glideTime},
      modMix: ${preset.controllers.modMix},
      osc3FilterEgSwitch: ${preset.controllers.osc3FilterEgSwitch},
      noiseLfoSwitch: ${preset.controllers.noiseLfoSwitch},
    },
    filter: {
      filterCutoff: ${preset.filter.filterCutoff},
      filterEmphasis: ${preset.filter.filterEmphasis},
      filterContourAmount: ${preset.filter.filterContourAmount},
      filterAttack: ${preset.filter.filterAttack},
      filterDecay: ${preset.filter.filterDecay},
      filterSustain: ${preset.filter.filterSustain},
      filterModulationOn: ${preset.filter.filterModulationOn},
    },
    loudness: {
      loudnessAttack: ${preset.loudness.loudnessAttack},
      loudnessDecay: ${preset.loudness.loudnessDecay},
      loudnessSustain: ${preset.loudness.loudnessSustain},
    },
    oscillators: {
      oscillator1: {
        waveform: "${preset.oscillators.oscillator1.waveform}",
        frequency: ${preset.oscillators.oscillator1.frequency},
        range: "${preset.oscillators.oscillator1.range}",
        enabled: ${preset.oscillators.oscillator1.enabled},
      },
      oscillator2: {
        waveform: "${preset.oscillators.oscillator2.waveform}",
        frequency: ${preset.oscillators.oscillator2.frequency},
        range: "${preset.oscillators.oscillator2.range}",
        enabled: ${preset.oscillators.oscillator2.enabled},
      },
      oscillator3: {
        waveform: "${preset.oscillators.oscillator3.waveform}",
        frequency: ${preset.oscillators.oscillator3.frequency},
        range: "${preset.oscillators.oscillator3.range}",
        enabled: ${preset.oscillators.oscillator3.enabled},
      },
      mixer: {
        osc1: { enabled: ${preset.oscillators.mixer.osc1.enabled}, volume: ${preset.oscillators.mixer.osc1.volume} },
        osc2: { enabled: ${preset.oscillators.mixer.osc2.enabled}, volume: ${preset.oscillators.mixer.osc2.volume} },
        osc3: { enabled: ${preset.oscillators.mixer.osc3.enabled}, volume: ${preset.oscillators.mixer.osc3.volume} },
        noise: { enabled: ${preset.oscillators.mixer.noise.enabled}, volume: ${preset.oscillators.mixer.noise.volume}, noiseType: "${preset.oscillators.mixer.noise.noiseType}" },
        external: { enabled: ${preset.oscillators.mixer.external.enabled}, volume: ${preset.oscillators.mixer.external.volume} },
      },
    },
    sidePanel: {
      glideOn: ${preset.sidePanel.glideOn},
      decaySwitchOn: ${preset.sidePanel.decaySwitchOn},
      lfoRate: ${preset.sidePanel.lfoRate},
      lfoWaveform: "${preset.sidePanel.lfoWaveform}",
      modWheel: ${preset.sidePanel.modWheel},
    },
    mainVolume: ${preset.mainVolume},
  },`;

      // Copy to clipboard
      await navigator.clipboard.writeText(presetJs);

      showToast({
        title: "Preset Saved",
        description: "Current state copied to clipboard as preset",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save preset:", error);
      showToast({
        title: "Error",
        description: "Failed to save preset to clipboard",
        variant: "error",
      });
    }
  }, [showToast]);

  return (
    <button
      onClick={handleSavePreset}
      disabled={disabled}
      className={styles.savePresetButton}
      aria-label="Save current state as preset"
    >
      Save Preset
    </button>
  );
}

export default SavePreset;
