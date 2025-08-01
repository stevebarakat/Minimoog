import { useState, useEffect } from "react";

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Start visible by default

  useEffect(() => {
    // Small delay to ensure components are mounted
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
    setIsVisible(true);
  };

  return {
    isVisible,
    currentStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    hasCompletedOnboarding: false, // Always false since we don't persist
  };
}
