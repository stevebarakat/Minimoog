import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SynthState, SynthActions } from "./types/synth";
import { createInitialState } from "./initialState";
import { createSynthActions } from "./actions/synthActions";
import { isDevMode } from "@/config";

// Create the store with conditional persistence
// In development mode, localStorage persistence is disabled to prevent
// cluttering the browser's storage during development and testing
const createStore = () => {
  // In development mode, don't persist to localStorage
  if (isDevMode()) {
    return create<SynthState & SynthActions>()((set) => ({
      ...createInitialState(),
      ...createSynthActions(set),
    }));
  }

  // In production, persist specific state to localStorage
  return create<SynthState & SynthActions>()(
    persist(
      (set) => ({
        ...createInitialState(),
        ...createSynthActions(set),
      }),
      {
        name: "synth-storage",
        partialize: (state) => ({
          modWheel: state.modWheel,
          mainVolume: state.mainVolume,
          isMainActive: state.isMainActive,
          mixer: state.mixer,
        }),
      }
    )
  );
};

export const useSynthStore = createStore();
