global.ResizeObserver =
  global.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

import React from "react";
import { render } from "@testing-library/react";
import Onboarding from "../Onboarding";
import { useOnboarding } from "../hooks/useOnboarding";

vi.mock("../hooks/useOnboarding");

const mockUseOnboarding = useOnboarding as jest.MockedFunction<
  typeof useOnboarding
>;

describe("Onboarding", () => {
  it("renders without crashing", () => {
    mockUseOnboarding.mockReturnValue({
      isVisible: true,
      currentStep: 0,
      nextStep: vi.fn(),
      previousStep: vi.fn(),
      skipOnboarding: vi.fn(),
      completeOnboarding: vi.fn(),
      resetOnboarding: vi.fn(),
      hasCompletedOnboarding: false,
    });
    render(<Onboarding />);
  });
});
