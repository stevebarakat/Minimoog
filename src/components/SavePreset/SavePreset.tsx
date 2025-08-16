import { useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { convertStateToPresetFormat, log as logger } from "@/utils";
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
      const osc1 = preset.oscillators.oscillator1!;
      const osc2 = preset.oscillators.oscillator2!;
      const osc3 = preset.oscillators.oscillator3!;
      const mixer = preset.oscillators.mixer!;

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
      oscillatorModulationOn: ${preset.controllers.oscillatorModulationOn},
      osc3Control: ${preset.controllers.osc3Control},
      keyboardControl1: ${preset.controllers.keyboardControl1},
      keyboardControl2: ${preset.controllers.keyboardControl2},
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
        waveform: "${osc1.waveform}",
        frequency: createFrequencyRange(${osc1.frequency}),
        range: "${osc1.range}",
        enabled: ${osc1.enabled},
        volume: createVolumeRange(${osc1.volume}),
      },
      oscillator2: {
        waveform: "${osc2.waveform}",
        frequency: createFrequencyRange(${osc2.frequency}),
        range: "${osc2.range}",
        enabled: ${osc2.enabled},
        volume: createVolumeRange(${osc2.volume}),
      },
      oscillator3: {
        waveform: "${osc3.waveform}",
        frequency: createFrequencyRange(${osc3.frequency}),
        range: "${osc3.range}",
        enabled: ${osc3.enabled},
        volume: createVolumeRange(${osc3.volume}),
      },
      mixer: {
        noise: {
          enabled: ${mixer.noise!.enabled},
          volume: createNoiseVolumeRange(${mixer.noise!.volume}),
          noiseType: "${mixer.noise!.noiseType}",
        },
        external: {
          enabled: ${mixer.external!.enabled},
          volume: createExternalInputVolumeRange(${mixer.external!.volume}),
        },
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
        description: "Current settings copied to clipboard as preset",
        variant: "success",
      });
    } catch (error) {
      logger.error("Failed to save preset:", error);
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
