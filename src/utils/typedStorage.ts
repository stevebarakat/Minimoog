import { typedLocalStorage } from "@yeunoia/typed-storage";
import { logger } from "./logUtils";
import { DEFAULT_USER_SETTINGS } from "@/config/constants";
import type { SynthState } from "@/store/types/synth";

// User Settings Storage
export type Options = {
  welcomeTour: boolean;
  tooltips: boolean;
  magnifyKnobs: boolean;
  onboardingVisible: boolean;
};

export const userSettingsStorage = typedLocalStorage<"options", Options>({
  options: {
    prefix: "minimoog",
    serializer: {
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn("Failed to deserialize user settings:", error);
          return DEFAULT_USER_SETTINGS;
        }
      },
    },
  },
});

// Effects Storage
export type EffectType = "delay" | "reverb";

export const effectsStorage = typedLocalStorage<
  "effects-open" | "effects-positions",
  Set<EffectType> | Record<string, { x: number; y: number }>
>({
  options: {
    prefix: "minimoog",
    serializer: {
      serialize: (value) => {
        if (value instanceof Set) {
          return JSON.stringify(Array.from(value));
        }
        return JSON.stringify(value);
      },
      deserialize: (value) => {
        try {
          const parsed = JSON.parse(value);
          // Determine if it's a Set (effects-open) or Record (positions)
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
          return parsed;
        } catch (error) {
          logger.warn("Failed to deserialize effects data:", error);
          return value instanceof Set ? new Set() : {};
        }
      },
    },
  },
});

// Synth Settings Storage
export type SynthSettings = Omit<
  SynthState,
  "audioContext" | "activeKeys" | "options"
>;

export const synthSettingsStorage = typedLocalStorage<
  "synth-settings",
  SynthSettings
>({
  options: {
    prefix: "minimoog",
    serializer: {
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn("Failed to deserialize synth settings:", error);
          return null;
        }
      },
    },
  },
});

// User Settings API
export function loadUserSettings(): Options {
  try {
    const stored = userSettingsStorage.get("options");
    if (stored) {
      return {
        welcomeTour: stored.welcomeTour ?? DEFAULT_USER_SETTINGS.welcomeTour,
        tooltips: stored.tooltips ?? DEFAULT_USER_SETTINGS.tooltips,
        magnifyKnobs: stored.magnifyKnobs ?? DEFAULT_USER_SETTINGS.magnifyKnobs,
        onboardingVisible:
          stored.onboardingVisible ?? DEFAULT_USER_SETTINGS.onboardingVisible,
      };
    }
  } catch (error) {
    logger.warn("Failed to load user settings from typed storage:", error);
  }

  return { ...DEFAULT_USER_SETTINGS };
}

export function saveUserSettings(settings: Partial<Options>): void {
  try {
    const current = loadUserSettings();
    const updated = { ...current, ...settings };
    userSettingsStorage.set("options", updated);
  } catch (error) {
    logger.warn("Failed to save user settings to typed storage:", error);
  }
}

// Effects API
export function loadOpenEffects(): Set<EffectType> {
  try {
    const stored = effectsStorage.get("effects-open");
    return stored instanceof Set ? stored : new Set();
  } catch (error) {
    logger.warn("Failed to load open effects from typed storage:", error);
    return new Set();
  }
}

export function saveOpenEffects(effects: Set<EffectType>): void {
  try {
    effectsStorage.set("effects-open", effects);
  } catch (error) {
    logger.warn("Failed to save open effects to typed storage:", error);
  }
}

export function loadPanelPositions(): Record<string, { x: number; y: number }> {
  try {
    const stored = effectsStorage.get("effects-positions");
    return stored && typeof stored === "object" && !(stored instanceof Set)
      ? (stored as Record<string, { x: number; y: number }>)
      : {};
  } catch (error) {
    logger.warn("Failed to load panel positions from typed storage:", error);
    return {};
  }
}

export function savePanelPositions(
  positions: Record<string, { x: number; y: number }>
): void {
  try {
    effectsStorage.set("effects-positions", positions);
  } catch (error) {
    logger.warn("Failed to save panel positions to typed storage:", error);
  }
}

// Synth Settings API
export function loadSynthSettings(): SynthSettings | null {
  try {
    const stored = synthSettingsStorage.get("synth-settings");
    return stored;
  } catch (error) {
    logger.warn("Failed to load synth settings from typed storage:", error);
    return null;
  }
}

export function saveSynthSettings(settings: SynthSettings): void {
  try {
    synthSettingsStorage.set("synth-settings", settings);
  } catch (error) {
    logger.warn("Failed to save synth settings to typed storage:", error);
  }
}

export function clearSynthSettings(): void {
  try {
    synthSettingsStorage.remove("synth-settings");
  } catch (error) {
    logger.warn("Failed to clear synth settings from typed storage:", error);
  }
}
