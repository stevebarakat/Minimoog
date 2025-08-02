import { useState, useEffect } from "react";

export function useOnboarding(totalSteps: number = 13) {
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

  const goToStep = (stepIndex: number) => {
    setCurrentStep(Math.max(0, Math.min(stepIndex, totalSteps - 1)));
  };

  return {
    isVisible,
    currentStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    goToStep,
    hasCompletedOnboarding: false, // Always false since we don't persist
  };
}
