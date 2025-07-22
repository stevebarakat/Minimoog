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
