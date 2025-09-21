import { create } from "zustand";
import { SynthState, SynthActions } from "./types/synth";
import { createInitialState } from "./initialState";
import { createSynthActions } from "./actions/synthActions";

// Create the store without localStorage persistence
const createStore = () => {
  return create<SynthState & SynthActions>()((set) => ({
    ...createInitialState(),
    ...createSynthActions(set),
  }));
};

export const useSynthStore = createStore();
