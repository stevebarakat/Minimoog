import { render, screen } from "@/test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

// Mock the utils
vi.mock("@/utils", () => ({
  copyURLToClipboard: vi.fn().mockResolvedValue(undefined),
  saveStateToURL: vi.fn().mockReturnValue("mock-url-params"),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

import CopySettings from "../CopySettings";
import { useSynthStore } from "@/store/synthStore";
import { copyURLToClipboard } from "@/utils";

const mockedUseSynthStore = vi.mocked(useSynthStore);
const mockedCopyURLToClipboard = vi.mocked(copyURLToClipboard);

describe("CopySettings", () => {
  const mockSynthState = {
    oscillator1: { frequency: 440, waveform: "sawtooth", enabled: true, range: "8" },
    oscillator2: { frequency: 440, waveform: "sawtooth", enabled: false, range: "8" },
    oscillator3: { frequency: 440, waveform: "sawtooth", enabled: false, range: "8" },
    mixer: {
      osc1: { enabled: true, volume: 5 },
      osc2: { enabled: false, volume: 3 },
      osc3: { enabled: false, volume: 7 },
      noise: { enabled: false, volume: 0, noiseType: "white" },
      external: { enabled: false, volume: 0 },
    },
    filterCutoff: 0,
    filterEmphasis: 5,
    filterContourAmount: 5,
    filterAttack: 0.5,
    filterDecay: 2.5,
    filterSustain: 5,
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
    loudnessDecay: 2.5,
    loudnessSustain: 8,
    decaySwitchOn: false,
    glideOn: false,
    glideTime: 0.1,
    masterTune: 0,
    pitchWheel: 50,
    modWheel: 50,
    mainVolume: 5,
    isMainActive: true,
    tunerOn: false,
    auxOutput: { enabled: false, volume: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockSynthState);
      }
      return mockSynthState;
    });
  });

  it("renders copy settings button", () => {
    render(<CopySettings disabled={false} />, { withToast: true });

    expect(
      screen.getByRole("button", { name: /copy current settings as url/i })
    ).toBeInTheDocument();
  });

  it("shows 'Copy Settings' text initially", () => {
    render(<CopySettings disabled={false} />, { withToast: true });

    expect(screen.getByText("Copy Settings")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<CopySettings disabled={true} />, { withToast: true });

    const button = screen.getByRole("button", {
      name: /copy current settings as url/i,
    });
    expect(button).toBeDisabled();
  });

  it("calls copyURLToClipboard when clicked", async () => {
    const user = userEvent.setup();
    render(<CopySettings disabled={false} />, { withToast: true });

    const button = screen.getByRole("button", {
      name: /copy current settings as url/i,
    });
    await user.click(button);

    expect(mockedCopyURLToClipboard).toHaveBeenCalledWith(mockSynthState);
  });

  it("shows 'Copied!' message after successful copy", async () => {
    const user = userEvent.setup();
    render(<CopySettings disabled={false} />, { withToast: true });

    const button = screen.getByRole("button", {
      name: /copy current settings as url/i,
    });
    await user.click(button);

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
