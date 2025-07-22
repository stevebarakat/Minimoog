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
  // Create a complete synth state by merging preset parameters with defaults
  const completeState = createCompleteStateFromPreset(preset);

  // Convert to URL parameters
  const urlParams = saveStateToURL(completeState);

  // Return full URL
  return `${baseURL}?${urlParams}`;
}

/**
 * Creates a complete SynthState by merging preset parameters with default state
 */
function createCompleteStateFromPreset(preset: Preset): SynthState {
  // Get the initial state as a base
  const defaultState = createInitialState();

  // Convert preset to store format
  const presetParameters = convertPresetToStoreFormat(preset);

  // Deep merge preset parameters with default state
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
