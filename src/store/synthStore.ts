import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SynthState, SynthActions } from "./types/synth";
import { createInitialState } from "./state/initialState";
import { createSynthActions } from "./actions/synthActions";

export const useSynthStore = create<SynthState & SynthActions>()(
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
      }),
    }
  )
);
