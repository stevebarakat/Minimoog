import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveStateToURL,
  loadStateFromURL,
  updateURLWithState,
  copyURLToClipboard,
} from "../urlUtils";
import { createInitialState } from "@/store/state/initialState";

// Mock window.location and navigator.clipboard
const mockLocation = {
  pathname: "/",
  search: "",
  origin: "http://localhost:5173",
};

const mockHistory = {
  replaceState: vi.fn(),
};

const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(window, "history", {
  value: mockHistory,
  writable: true,
});

Object.defineProperty(navigator, "clipboard", {
  value: mockClipboard,
  writable: true,
});

describe("URL State Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = "";
  });

  describe("saveStateToURL", () => {
    it("should convert synth state to URL parameters", () => {
      const state = createInitialState();
      const params = saveStateToURL(state);

      expect(params).toContain("osc1_waveform=");
      expect(params).toContain("osc1_freq=");
      expect(params).toContain("filter_cutoff=");
      expect(params).toContain("main_volume=");
    });

    it("should include all oscillator settings", () => {
      const state = createInitialState();
      const params = saveStateToURL(state);

      expect(params).toContain("osc1_waveform=");
      expect(params).toContain("osc2_waveform=");
      expect(params).toContain("osc3_waveform=");
      expect(params).toContain("osc1_enabled=");
      expect(params).toContain("osc2_enabled=");
      expect(params).toContain("osc3_enabled=");
    });

    it("should include mixer settings", () => {
      const state = createInitialState();
      const params = saveStateToURL(state);

      expect(params).toContain("mix_osc1_enabled=");
      expect(params).toContain("mix_osc1_vol=");
      expect(params).toContain("mix_noise_enabled=");
      expect(params).toContain("mix_noise_type=");
    });
  });

  describe("loadStateFromURL", () => {
    it("should return null for empty URL", () => {
      const result = loadStateFromURL();
      expect(result).toBeNull();
    });

    it("should parse oscillator settings from URL", () => {
      mockLocation.search =
        "?osc1_waveform=triangle&osc1_freq=220&osc1_range=16&osc1_enabled=true";
      const result = loadStateFromURL();

      expect(result).toEqual({
        oscillator1: {
          waveform: "triangle",
          frequency: 220,
          range: "16",
          enabled: true,
        },
      });
    });

    it("should parse mixer settings from URL", () => {
      mockLocation.search =
        "?mix_osc1_enabled=true&mix_osc1_vol=10&mix_osc2_enabled=true&mix_osc2_vol=6&mix_osc3_enabled=true&mix_osc3_vol=4&mix_noise_enabled=true&mix_noise_vol=5&mix_noise_type=pink&mix_ext_enabled=false&mix_ext_vol=0";
      const result = loadStateFromURL();

      expect(result).toEqual({
        mixer: {
          osc1: { enabled: true, volume: 10 },
          osc2: { enabled: true, volume: 6 },
          osc3: { enabled: true, volume: 4 },
          noise: { enabled: true, volume: 5, noiseType: "pink" },
          external: { enabled: false, volume: 0 },
        },
      });
    });

    it("should parse filter settings from URL", () => {
      mockLocation.search =
        "?filter_cutoff=4&filter_emphasis=8&filter_contour=6&filter_attack=1&filter_decay=3&filter_sustain=5&filter_mod_on=true";
      const result = loadStateFromURL();

      expect(result).toEqual({
        filterCutoff: 4,
        filterEmphasis: 8,
        filterContourAmount: 6,
        filterAttack: 1,
        filterDecay: 3,
        filterSustain: 5,
        filterModulationOn: true,
      });
    });

    it("should handle partial URL parameters", () => {
      mockLocation.search = "?osc1_waveform=triangle&main_volume=9";
      const result = loadStateFromURL();

      expect(result).toEqual({
        oscillator1: {
          waveform: "triangle",
          frequency: 440, // Function's hardcoded default
          range: null, // Function's hardcoded default (null when not provided)
          enabled: false, // Function's hardcoded default (false when not provided)
        },
        mainVolume: 9,
        isMainActive: false, // Function's hardcoded default (false when not provided)
      });
    });
  });

  describe("updateURLWithState", () => {
    it("should update window history with new URL", () => {
      const state = createInitialState();
      updateURLWithState(state);

      expect(mockHistory.replaceState).toHaveBeenCalled();
    });
  });

  describe("copyURLToClipboard", () => {
    it("should copy URL to clipboard", async () => {
      const state = createInitialState();
      await copyURLToClipboard(state);

      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });
});
