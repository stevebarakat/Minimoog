import { SynthState } from "./types/synth";
import { DEFAULT_SYNTH_STATE } from "@/config";

export function createInitialState(): SynthState {
  // Start with the base default state
  const initialState = {
    // Runtime state (not persisted)
    audioContext: {
      isReady: false,
      error: null,
      context: null,
    },
    activeKeys: null,
    // Persistent state
    ...DEFAULT_SYNTH_STATE,
  };

  // Preset loading disabled - presets system disabled for now
  /*
  // If a default preset is configured, apply it
  if (DEFAULT_PRESET_ID) {
    const defaultPreset = getPresetById(DEFAULT_PRESET_ID);
    if (defaultPreset) {
      const presetState = convertPresetToStoreFormat(defaultPreset);
      initialState = {
        ...initialState,
        ...presetState,
      };
    }
  }
  */

  return initialState;
}
