import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import ModulationSwitch from "../ModulationSwitch";
import { useSynthStore } from "@/store/synthStore";
import { renderWithProviders } from "@/test/testHelpers";

// Mock the store
const mockSetFilterModulationOn = vi.fn();

vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  useIsSynthDisabled: () => false,
  useMagnifyKnobs: vi.fn(() => false),
  useTooltips: vi.fn(() => true),
}));

describe("ModulationSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const state = {
        filterModulationOn: false,
        setFilterModulationOn: mockSetFilterModulationOn,
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
          onboardingVisible: false,
        },
      };
      return selector(state);
    });
  });

  it("renders with correct initial state", () => {
    renderWithProviders(<ModulationSwitch />, { withToast: true });

    const switchElement = screen.getByRole("button", {
      name: /filter modulation/i,
    });
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute("aria-pressed", "false");
  });

  it("displays as checked when filterModulationOn is true", () => {
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const state = {
        filterModulationOn: true,
        setFilterModulationOn: mockSetFilterModulationOn,
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
          onboardingVisible: false,
        },
      };
      return selector(state);
    });

    renderWithProviders(<ModulationSwitch />, { withToast: true });

    const switchElement = screen.getByRole("button", {
      name: /filter modulation/i,
    });
    expect(switchElement).toHaveAttribute("aria-pressed", "true");
  });

  it("calls setFilterModulationOn when toggled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModulationSwitch />, { withToast: true });

    const switchElement = screen.getByRole("button", {
      name: /filter modulation/i,
    });
    await user.click(switchElement);

    expect(mockSetFilterModulationOn).toHaveBeenCalledWith(true);
  });

  it("toggles from on to off", async () => {
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const state = {
        filterModulationOn: true,
        setFilterModulationOn: mockSetFilterModulationOn,
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
          onboardingVisible: false,
        },
      };
      return selector(state);
    });

    const user = userEvent.setup();
    renderWithProviders(<ModulationSwitch />, { withToast: true });

    const switchElement = screen.getByRole("button", {
      name: /filter modulation/i,
    });
    await user.click(switchElement);

    expect(mockSetFilterModulationOn).toHaveBeenCalledWith(false);
  });

  it("has correct labels", () => {
    renderWithProviders(<ModulationSwitch />, { withToast: true });

    expect(
      screen.getByRole("button", { name: /filter modulation/i })
    ).toBeInTheDocument();
    expect(screen.getByText("On")).toBeInTheDocument();
  });
});
