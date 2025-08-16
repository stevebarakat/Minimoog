import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Controllers from "../Controllers";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Controllers modulation routing", () => {
  const mockSetOsc3FilterEgSwitch = vi.fn();
  const mockSetNoiseLfoSwitch = vi.fn();
  const mockSetModMix = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockReturnValue({
      // Controllers
      osc3FilterEgSwitch: false,
      setOsc3FilterEgSwitch: mockSetOsc3FilterEgSwitch,
      noiseLfoSwitch: false,
      setNoiseLfoSwitch: mockSetNoiseLfoSwitch,
      isDisabled: false,
      // ModulationMix
      modMix: 0,
      setModMix: mockSetModMix,
      // Glide
      glideTime: 0,
      setGlideTime: vi.fn(),
      // Tune
      masterTune: 0,
      setMasterTune: vi.fn(),
    } as Partial<ReturnType<typeof useSynthStore>>);
  });

  // Removed the test 'toggles modulation source switches and updates state' as requested by the user.

  it("changes Modulation Mix knob and updates state", () => {
    render(<Controllers />);

    const modMixKnob = screen.getByRole("slider", { name: "Modulation Mix" });

    // Simulate keyboard interaction to change value
    modMixKnob.focus();
    fireEvent.keyDown(modMixKnob, { key: "ArrowUp" });

    // The setModMix function should have been called
    expect(mockSetModMix).toHaveBeenCalled();
  });
});
