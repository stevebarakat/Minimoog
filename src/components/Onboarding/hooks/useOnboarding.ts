import { useState, useEffect } from "react";

export function useOnboarding(totalSteps: number = 13) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnboardingEnabled, setIsOnboardingEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("minimoog-onboarding-enabled");
      return stored !== null ? JSON.parse(stored) : true; // Default to enabled
    } catch {
      return true; // Default to enabled if localStorage fails
    }
  });

  useEffect(() => {
    // Only show onboarding if onboarding is enabled
    if (isOnboardingEnabled) {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOnboardingEnabled]);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const skipOnboarding = () => {
    setIsVisible(false);
  };

  const completeOnboarding = () => {
    setIsVisible(false);
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    if (isOnboardingEnabled) {
      setIsVisible(true);
    }
  };

  const toggleOnboarding = () => {
    const newValue = !isOnboardingEnabled;
    setIsOnboardingEnabled(newValue);
    try {
      localStorage.setItem(
        "minimoog-onboarding-enabled",
        JSON.stringify(newValue)
      );
    } catch (error) {
      console.warn("Failed to save onboarding setting to localStorage:", error);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(Math.max(0, Math.min(stepIndex, totalSteps - 1)));
  };

  return {
    isVisible,
    currentStep,
    isOnboardingEnabled,
    toggleOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    goToStep,
    hasCompletedOnboarding: false, // Always false since we don't persist
  };
}
