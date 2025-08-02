import { Preset } from "@/data/presets";
import { SynthState } from "@/store/types/synth";

/**
 * Converts a preset to the format expected by the synth store
 */
export function convertPresetToStoreFormat(
  preset: Preset
): Partial<SynthState> {
  return {
    // Controllers
    masterTune: preset.controllers.tune,
    glideTime: preset.controllers.glideTime,
    modMix: preset.controllers.modMix,
    osc3FilterEgSwitch: preset.controllers.osc3FilterEgSwitch,
    noiseLfoSwitch: preset.controllers.noiseLfoSwitch,

    // Filter
    filterCutoff: preset.filter.filterCutoff,
    filterEmphasis: preset.filter.filterEmphasis,
    filterContourAmount: preset.filter.filterContourAmount,
    filterAttack: preset.filter.filterAttack,
    filterDecay: preset.filter.filterDecay,
    filterSustain: preset.filter.filterSustain,
    filterModulationOn: preset.filter.filterModulationOn,

    // Loudness envelope
    loudnessAttack: preset.loudness.loudnessAttack,
    loudnessDecay: preset.loudness.loudnessDecay,
    loudnessSustain: preset.loudness.loudnessSustain,

    // Oscillators (already in the correct format)
    oscillator1: preset.oscillators.oscillator1,
    oscillator2: preset.oscillators.oscillator2,
    oscillator3: preset.oscillators.oscillator3,
    mixer: preset.oscillators.mixer,

    // Side panel
    glideOn: preset.sidePanel.glideOn,
    decaySwitchOn: preset.sidePanel.decaySwitchOn,
    lfoRate: preset.sidePanel.lfoRate,
    lfoWaveform: preset.sidePanel.lfoWaveform,
    modWheel: preset.sidePanel.modWheel,

    // Main volume
    mainVolume: preset.mainVolume,
  };
}

/**
 * Converts the current synth state to a preset format for clipboard copying
 */
export function convertStateToPresetFormat(
  state: Partial<SynthState>,
  id: string = "custom-preset",
  name: string = "Custom Preset",
  description: string = "Custom preset created from current state",
  category: string = "Custom"
): Preset {
  return {
    id,
    name,
    description,
    category,
    controllers: {
      tune: state.masterTune ?? 5,
      glideTime: state.glideTime ?? 0,
      modMix: state.modMix ?? 2,
      osc3FilterEgSwitch: state.osc3FilterEgSwitch ?? true,
      noiseLfoSwitch: state.noiseLfoSwitch ?? false,
    },
    filter: {
      filterCutoff: state.filterCutoff ?? 3,
      filterEmphasis: state.filterEmphasis ?? 7,
      filterContourAmount: state.filterContourAmount ?? 8,
      filterAttack: state.filterAttack ?? 0.1,
      filterDecay: state.filterDecay ?? 4,
      filterSustain: state.filterSustain ?? 3,
      filterModulationOn: state.filterModulationOn ?? false,
    },
    loudness: {
      loudnessAttack: state.loudnessAttack ?? 0.1,
      loudnessDecay: state.loudnessDecay ?? 3,
      loudnessSustain: state.loudnessSustain ?? 6,
    },
    oscillators: {
      oscillator1: state.oscillator1 ?? {
        waveform: "sawtooth",
        frequency: 0,
        range: "32",
        enabled: true,
      },
      oscillator2: state.oscillator2 ?? {
        waveform: "sawtooth",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      oscillator3: state.oscillator3 ?? {
        waveform: "triangle",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      mixer: state.mixer ?? {
        osc1: { enabled: true, volume: 10 },
        osc2: { enabled: true, volume: 8 },
        osc3: { enabled: true, volume: 6 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0 },
      },
    },
    sidePanel: {
      glideOn: state.glideOn ?? false,
      decaySwitchOn: state.decaySwitchOn ?? false,
      lfoRate: state.lfoRate ?? 5,
      lfoWaveform: state.lfoWaveform ?? "triangle",
      modWheel: state.modWheel ?? 50,
    },
    mainVolume: state.mainVolume ?? 5,
  };
}
