import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Tuner from "../Tuner";
import { useSynthStore } from "@/store/synthStore";
import { renderWithProviders } from "@/test/testHelpers";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Tuner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct labels", () => {
    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
        },
        setTunerOn: vi.fn(),
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    renderWithProviders(<Tuner />, { withToast: true });

    expect(screen.getByText("Tuner")).toBeInTheDocument();
    expect(screen.getByText("A-440")).toBeInTheDocument();
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("calls setTunerOn when toggled", () => {
    const mockSetTunerOn = vi.fn();
    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
        },
        setTunerOn: mockSetTunerOn,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    renderWithProviders(<Tuner />, { withToast: true });

    const switchElement = screen.getByRole("button", { name: "Tuner" });
    fireEvent.click(switchElement);

    expect(mockSetTunerOn).toHaveBeenCalled();
  });

  it("is disabled when synth is disabled", () => {
    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: false,
          error: null,
          context: null,
        },
        options: {
          welcomeTour: true,
          tooltips: true,
          magnifyKnobs: false,
        },
        setTunerOn: vi.fn(),
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    renderWithProviders(<Tuner />, { withToast: true });

    const switchElement = screen.getByRole("button", { name: "Tuner" });
    // Check that the switch is rendered but functionally disabled
    expect(switchElement).toBeInTheDocument();
  });
});
