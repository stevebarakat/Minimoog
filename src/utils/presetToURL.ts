import { Preset } from "@/data/presets";
import { SynthState } from "@/store/types/synth";
import { saveStateToURL } from "./urlState";
import { createInitialState } from "@/store/state/initialState";
import { convertPresetToStoreFormat } from "./presetConversion";

/**
 * Converts a preset to a URL with the preset parameters
 */
export function presetToURL(
  preset: Preset,
  baseURL: string = window.location.origin
): string {
  const completeState = createCompleteStateFromPreset(preset);
  const urlParams = saveStateToURL(completeState);
  return `${baseURL}?${urlParams}`;
}

/**
 * Creates a complete SynthState by merging preset parameters with default state
 */
function createCompleteStateFromPreset(preset: Preset): SynthState {
  const defaultState = createInitialState();
  const presetParameters = convertPresetToStoreFormat(preset);
  return deepMerge(defaultState, presetParameters);
}

/**
 * Deep merge function to combine objects
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Gets the preset URL for sharing
 */
export function getPresetShareURL(preset: Preset): string {
  return presetToURL(preset);
}

/**
 * Creates a preset object with URL for easy sharing
 */
export function createPresetWithURL(
  preset: Preset
): Preset & { shareURL: string } {
  return {
    ...preset,
    shareURL: getPresetShareURL(preset),
  };
}
