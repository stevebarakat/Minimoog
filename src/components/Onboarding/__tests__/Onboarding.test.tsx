import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Onboarding from "../Onboarding";
import { useOnboarding } from "../hooks/useOnboarding";

// Mock the hook
jest.mock("../hooks/useOnboarding");

const mockUseOnboarding = useOnboarding as jest.MockedFunction<
  typeof useOnboarding
>;

describe("Onboarding", () => {
  const defaultMockProps = {
    isVisible: true,
    currentStep: 0,
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    skipOnboarding: jest.fn(),
    completeOnboarding: jest.fn(),
    resetOnboarding: jest.fn(),
    hasCompletedOnboarding: false,
  };

  beforeEach(() => {
    mockUseOnboarding.mockReturnValue(defaultMockProps);
  });

  it("renders onboarding when visible", () => {
    render(<Onboarding />);

    expect(screen.getByText("Welcome to the Minimoog!")).toBeInTheDocument();
    expect(
      screen.getByText(/This is a faithful recreation/)
    ).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    mockUseOnboarding.mockReturnValue({
      ...defaultMockProps,
      isVisible: false,
    });

    render(<Onboarding />);

    expect(
      screen.queryByText("Welcome to the Minimoog!")
    ).not.toBeInTheDocument();
  });

  it("calls nextStep when Next button is clicked", () => {
    render(<Onboarding />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(defaultMockProps.nextStep).toHaveBeenCalled();
  });

  it("calls skipOnboarding when Skip button is clicked", () => {
    render(<Onboarding />);

    const skipButton = screen.getByText("Skip");
    fireEvent.click(skipButton);

    expect(defaultMockProps.skipOnboarding).toHaveBeenCalled();
  });

  it("shows Previous button on non-first step", () => {
    mockUseOnboarding.mockReturnValue({
      ...defaultMockProps,
      currentStep: 1,
    });

    render(<Onboarding />);

    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("does not show Previous button on first step", () => {
    render(<Onboarding />);

    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
  });

  it("shows Get Started button on last step", () => {
    mockUseOnboarding.mockReturnValue({
      ...defaultMockProps,
      currentStep: 8, // Last step
    });

    render(<Onboarding />);

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("calls completeOnboarding when Get Started button is clicked", () => {
    mockUseOnboarding.mockReturnValue({
      ...defaultMockProps,
      currentStep: 8, // Last step
    });

    render(<Onboarding />);

    const getStartedButton = screen.getByText("Get Started");
    fireEvent.click(getStartedButton);

    expect(defaultMockProps.completeOnboarding).toHaveBeenCalled();
  });

  it("renders progress dots for all steps", () => {
    render(<Onboarding />);

    // Should have 9 dots for 9 steps
    const dots = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("dot"));
    expect(dots).toHaveLength(9);
  });
});
