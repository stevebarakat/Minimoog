import { getPresetById } from "@/data/presets";
import { SynthState } from "./types/synth";
import { DEFAULT_SYNTH_STATE, DEFAULT_PRESET_ID } from "@/config";
import { convertPresetToStoreFormat } from "@/utils/data";
import { loadUserSettings, loadSynthSettings } from "@/utils";

export function createInitialState(): SynthState {
  const options = loadUserSettings();
  const savedSynthSettings = loadSynthSettings();

  // Start with the base default state
  const initialState = {
    // Runtime state (not persisted)
    audioContext: {
      isReady: false,
      error: null,
      context: null,
    },
    activeKeys: null,
    // User settings (persistent) - stored separately
    options,
    // Persistent state - use saved settings if available, otherwise defaults
    ...(savedSynthSettings || DEFAULT_SYNTH_STATE),
  };

  // If a default preset is configured and no saved settings exist, apply it
  if (DEFAULT_PRESET_ID && !savedSynthSettings) {
    const defaultPreset = getPresetById(DEFAULT_PRESET_ID);
    if (defaultPreset) {
      const presetState = convertPresetToStoreFormat(defaultPreset);
      Object.assign(initialState, presetState);
    }
  }

  return initialState;
}
