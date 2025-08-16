import { Preset } from "@/data/presets";
import { SynthState } from "@/store/types/synth";
import {
  createVolumeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterEnvelopeRange,
  createLfoRateRange,
  createModMixRange,
  createMasterTuneRange,
  createGlideTimeRange,
  createModWheelRange,
} from "@/types/branded";

/**
 * Convert a preset format to the store state format
 */
export function convertPresetToStoreFormat(
  preset: Preset
): Partial<SynthState> {
  return {
    // Controllers
    masterTune: createMasterTuneRange(preset.controllers.tune),
    glideTime: createGlideTimeRange(preset.controllers.glideTime),
    modMix: createModMixRange(preset.controllers.modMix),
    osc3FilterEgSwitch: preset.controllers.osc3FilterEgSwitch,
    noiseLfoSwitch: preset.controllers.noiseLfoSwitch,
    oscillatorModulationOn: preset.controllers.oscillatorModulationOn,
    osc3Control: preset.controllers.osc3Control,
    keyboardControl1: preset.controllers.keyboardControl1,
    keyboardControl2: preset.controllers.keyboardControl2,

    // Filter
    filterCutoff: createFilterCutoffRange(preset.filter.filterCutoff),
    filterEmphasis: createFilterEmphasisRange(preset.filter.filterEmphasis),
    filterContourAmount: createFilterEnvelopeRange(
      preset.filter.filterContourAmount
    ),
    filterAttack: createFilterEnvelopeRange(preset.filter.filterAttack),
    filterDecay: createFilterEnvelopeRange(preset.filter.filterDecay),
    filterSustain: createFilterEnvelopeRange(preset.filter.filterSustain),
    filterModulationOn: preset.filter.filterModulationOn,

    // Loudness envelope
    loudnessAttack: createFilterEnvelopeRange(preset.loudness.loudnessAttack),
    loudnessDecay: createFilterEnvelopeRange(preset.loudness.loudnessDecay),
    loudnessSustain: createFilterEnvelopeRange(preset.loudness.loudnessSustain),

    // Side panel
    glideOn: preset.sidePanel.glideOn,
    decaySwitchOn: preset.sidePanel.decaySwitchOn,
    lfoRate: createLfoRateRange(preset.sidePanel.lfoRate),
    lfoWaveform: preset.sidePanel.lfoWaveform,
    modWheel: createModWheelRange(preset.sidePanel.modWheel),

    // Main volume
    mainVolume: createVolumeRange(preset.mainVolume),

    // Oscillators - these come from the oscillators property
    ...preset.oscillators,
  };
}

/**
 * Convert synth store state to preset format
 */
export function convertStateToPresetFormat(
  state: SynthState,
  id: string,
  name: string,
  description: string,
  category: string
): Preset {
  return {
    id,
    name,
    description,
    category,
    controllers: {
      tune: state.masterTune || 0,
      glideTime: state.glideTime || 0,
      modMix: state.modMix || 0,
      osc3FilterEgSwitch: state.osc3FilterEgSwitch || false,
      noiseLfoSwitch: state.noiseLfoSwitch || false,
      oscillatorModulationOn: state.oscillatorModulationOn || false,
      osc3Control: state.osc3Control || false,
      keyboardControl1: state.keyboardControl1 || false,
      keyboardControl2: state.keyboardControl2 || false,
    },
    filter: {
      filterCutoff: state.filterCutoff || 0,
      filterEmphasis: state.filterEmphasis || 0,
      filterContourAmount: state.filterContourAmount || 0,
      filterAttack: state.filterAttack || 0,
      filterDecay: state.filterDecay || 0,
      filterSustain: state.filterSustain || 0,
      filterModulationOn: state.filterModulationOn || false,
    },
    loudness: {
      loudnessAttack: state.loudnessAttack || 0,
      loudnessDecay: state.loudnessDecay || 0,
      loudnessSustain: state.loudnessSustain || 0,
    },
    oscillators: {
      oscillator1: state.oscillator1,
      oscillator2: state.oscillator2,
      oscillator3: state.oscillator3,
      mixer: state.mixer,
    },
    sidePanel: {
      glideOn: state.glideOn || false,
      decaySwitchOn: state.decaySwitchOn || false,
      lfoRate: state.lfoRate || 0,
      lfoWaveform: state.lfoWaveform || "triangle",
      modWheel: state.modWheel || 0,
    },
    mainVolume: state.mainVolume || 0,
  };
}
