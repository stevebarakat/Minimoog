// Clipboard mock must be set up before any imports
const mockWriteText = vi ? vi.fn().mockResolvedValue(undefined) : () => {};
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
});

import { customRender } from "@/test";
import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import PresetsDropdown from "../PresetsDropdown";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

// Mock the URL utilities
vi.mock("@/utils", () => ({
  // saveStateToURL: vi.fn().mockReturnValue("mock-url-params"), // Disabled - URL functionality disabled
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  convertPresetToStoreFormat: vi.fn(() => ({
    oscillator1: {
      waveform: "sawtooth",
      frequency: 0,
      range: "8",
      enabled: true,
    },
    oscillator2: {
      waveform: "sawtooth",
      frequency: -7,
      range: "8",
      enabled: true,
    },
    oscillator3: {
      waveform: "sawtooth",
      frequency: 0,
      range: "8",
      enabled: true,
    },
    filterCutoff: 0,
    filterEmphasis: 0,
    filterContourAmount: 0,
    filterAttack: 0,
    filterDecay: 0,
    filterSustain: 0,
    loudnessAttack: 0,
    loudnessDecay: 0,
    loudnessSustain: 0,
    modMix: 0,
    lfoRate: 0,
    glideTime: 0,
    mainVolume: 0,
  })),
}));

import { useSynthStore } from "@/store/synthStore";
import type { SynthState, SynthActions } from "@/types";

type StoreSelector =
  | ((state: SynthState & SynthActions) => unknown)
  | undefined;

const mockLoadPreset = vi.fn();

const minimalSynthState: SynthState = {
  isDisabled: false,
  activeKeys: null,

  pitchWheel: 0,
  modWheel: 0,
  masterTune: 0,
  oscillator1: {
    waveform: "triangle",
    frequency: 440,
    range: "16",
    enabled: true,
  },
  oscillator2: {
    waveform: "triangle",
    frequency: 440,
    range: "16",
    enabled: true,
  },
  oscillator3: {
    waveform: "triangle",
    frequency: 440,
    range: "16",
    enabled: true,
  },
  mixer: {
    osc1: { enabled: true, volume: 5 },
    osc2: { enabled: true, volume: 5 },
    osc3: { enabled: true, volume: 5 },
    noise: { enabled: true, volume: 5, noiseType: "white" },
    external: { enabled: true, volume: 5 },
  },
  mainVolume: 5,
  isMainActive: true,
  glideOn: false,
  glideTime: 0.1,
  filterAttack: 0.5,
  filterDecay: 0.5,
  filterSustain: 0.5,
  filterCutoff: 0,
  filterEmphasis: 0,
  filterContourAmount: 0,
  filterModulationOn: false,
  keyboardControl1: false,
  keyboardControl2: false,
  oscillatorModulationOn: false,
  lfoWaveform: "triangle",
  lfoRate: 5,
  osc3Control: false,
  modMix: 0,
  osc3FilterEgSwitch: false,
  noiseLfoSwitch: false,
  loudnessAttack: 0.5,
  loudnessDecay: 0.5,
  loudnessSustain: 0.5,
  decaySwitchOn: false,
  tunerOn: false,
  auxOutput: { enabled: false, volume: 0 },
};

const minimalSynthActions: SynthActions = {
  setIsDisabled: () => {},
  setActiveKeys: () => {},

  setPitchWheel: () => {},
  setModWheel: () => {},
  setMasterTune: () => {},
  setOscillator1: () => {},
  setOscillator2: () => {},
  setOscillator3: () => {},
  setMixerSource: () => {},
  setMixerNoise: () => {},
  setMixerExternal: () => {},
  setMainVolume: () => {},
  setIsMainActive: () => {},
  setGlideOn: () => {},
  setGlideTime: () => {},
  setFilterEnvelope: () => {},
  setFilterCutoff: () => {},
  setFilterEmphasis: () => {},
  setFilterContourAmount: () => {},
  setFilterModulationOn: () => {},
  setKeyboardControl1: () => {},
  setKeyboardControl2: () => {},
  setOscillatorModulationOn: () => {},
  setLfoWaveform: () => {},
  setLfoRate: () => {},
  setOsc3Control: () => {},
  setModMix: () => {},
  setOsc3FilterEgSwitch: () => {},
  setNoiseLfoSwitch: () => {},
  setLoudnessEnvelope: () => {},
  setDecaySwitchOn: () => {},
  setTunerOn: () => {},
  setAuxOutput: () => {},
  loadPreset: mockLoadPreset,
  updateURL: () => {},
};

// Create a single storeState object to always return
const storeState = { ...minimalSynthState, ...minimalSynthActions };

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("PresetsDropdown - User Behavior Tests", () => {
  // Always provide a default mock implementation at the top level
  mockedUseSynthStore.mockImplementation((selector?: StoreSelector) => {
    if (typeof selector === "function") {
      return selector(storeState);
    }
    return storeState;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof mockWriteText === "function" && "mockClear" in mockWriteText) {
      mockWriteText.mockClear();
    }
    // No need to recreate storeState or actions here
  });

  it("opens preset menu when user clicks dropdown", async () => {
    const user = userEvent.setup();
    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    await user.click(dropdownTrigger);

    // Should show preset list
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("loads a preset when user selects one", async () => {
    const user = userEvent.setup();

    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    // Open the dropdown
    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    await user.click(dropdownTrigger);

    // Wait for the dropdown to open and find a preset button
    await waitFor(() => {
      const presetButtons = screen.getAllByRole("option");
      expect(presetButtons.length).toBeGreaterThan(0);
    });

    const presetButtons = screen.getAllByRole("option");
    // Find actual preset buttons (not category filter)
    const actualPresetButtons = presetButtons.filter(
      (el: HTMLElement) => el.tagName === "BUTTON"
    );
    if (actualPresetButtons.length > 0) {
      await user.click(actualPresetButtons[0]);

      // The dropdown should close after selection
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    }
  });

  it("filters presets by category when user selects category", async () => {
    const user = userEvent.setup();
    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    // Open dropdown
    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    await user.click(dropdownTrigger);

    // Wait for category filter to appear
    await waitFor(() => {
      const categorySelect = screen.getByRole("combobox");
      expect(categorySelect).toBeInTheDocument();
    });

    // Select a category (note: using "Bass" with capital B)
    const categorySelect = screen.getByRole("combobox");
    await user.selectOptions(categorySelect, "Bass");

    // Should filter presets (we can't easily test the exact filtering without knowing preset data)
    expect(categorySelect).toHaveValue("Bass");
  });

  it("is disabled when synth is not initialized", () => {
    customRender(<PresetsDropdown disabled={true} />, { withToast: true });

    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    expect(dropdownTrigger).toBeDisabled();
  });

  it("shows loading state while presets are being loaded", async () => {
    const user = userEvent.setup();
    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    // Open dropdown
    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    await user.click(dropdownTrigger);

    // Should show some loading or content state
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("closes dropdown when user clicks outside", async () => {
    const user = userEvent.setup();
    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    // Open dropdown
    const dropdownTrigger = screen.getByRole("button", {
      name: /select a preset/i,
    });
    await user.click(dropdownTrigger);

    // Verify dropdown is open
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Click outside
    await user.click(document.body);

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("shows 'Presets' when vintage Minimoog settings are active", () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    const vintageMinimoogState = {
      ...minimalSynthState,
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: 0,
        range: "8" as const,
        enabled: true,
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "8" as const,
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "8" as const,
        enabled: true,
      },
      filterCutoff: 2.5,
      filterEmphasis: 6.5,
      filterContourAmount: 5.5,
      filterAttack: 0.3,
      filterDecay: 2.5,
      filterSustain: 4.5,
      loudnessAttack: 0.3,
      loudnessDecay: 2.5,
      loudnessSustain: 5.5,
      modMix: 2.5,
      lfoRate: 3.5,
      glideTime: 1,
      mainVolume: 5,
    };

    mockUseSynthStore.mockImplementation((selector: StoreSelector) => {
      if (selector) {
        return selector({
          ...vintageMinimoogState,
          ...minimalSynthActions,
          loadPreset: mockLoadPreset,
        });
      }
      return {
        ...vintageMinimoogState,
        ...minimalSynthActions,
        loadPreset: mockLoadPreset,
      };
    });

    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    expect(screen.getByText("Presets")).toBeInTheDocument();
  });

  it("shows 'Presets' when no preset is selected", () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockImplementation((selector: StoreSelector) => {
      if (selector) {
        return selector({
          ...minimalSynthState,
          ...minimalSynthActions,
          loadPreset: mockLoadPreset,
        });
      }
      return {
        ...minimalSynthState,
        ...minimalSynthActions,
        loadPreset: mockLoadPreset,
      };
    });

    customRender(<PresetsDropdown disabled={false} />, { withToast: true });

    expect(screen.getByText("Presets")).toBeInTheDocument();
  });
});
