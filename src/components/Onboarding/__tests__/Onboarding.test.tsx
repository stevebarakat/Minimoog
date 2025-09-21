import { describe, it } from "vitest";

global.ResizeObserver =
  global.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

import Onboarding from "../Onboarding";
import { useOnboarding } from "../hooks/useOnboarding";
import { MockedFunction, vi } from "vitest";
import { renderWithProviders } from "@/test/testHelpers";

vi.mock("../hooks/useOnboarding");

const mockUseOnboarding = useOnboarding as MockedFunction<typeof useOnboarding>;

describe("Onboarding", () => {
  it("renders without crashing", () => {
    mockUseOnboarding.mockReturnValue({
      isVisible: true,
      currentStep: 0,
      isOnboardingEnabled: true,
      toggleOnboarding: vi.fn(),
      goToStep: vi.fn(),
      nextStep: vi.fn(),
      previousStep: vi.fn(),
      closeOnboarding: vi.fn(),
      resetOnboarding: vi.fn(),
      hasCompletedOnboarding: false,
    });
    renderWithProviders(<Onboarding />);
  });
});
