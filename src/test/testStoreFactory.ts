import { create } from "zustand";
import { SynthState, SynthActions } from "@/store/types/synth";
import { createInitialState } from "@/store/initialState";
import { createSynthActions } from "@/store/actions/synthActions";

// Mock the typed storage functions for tests
const mockUserSettings = {
  welcomeTour: true,
  tooltips: true,
  magnifyKnobs: false,
};

// Create a test store with mocked options
export function createTestStore() {
  // Override the initial state to use mock options
  const testInitialState = {
    ...createInitialState(),
    options: mockUserSettings,
  };

  return create<SynthState & SynthActions>()((set) => ({
    ...testInitialState,
    ...createSynthActions(set),
  }));
}

// Export the mock options for use in tests
export { mockUserSettings };
