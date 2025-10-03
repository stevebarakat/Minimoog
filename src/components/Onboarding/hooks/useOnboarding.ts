import { useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";

export function useOnboarding(totalSteps: number = 14) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const welcomeTour = useSynthStore((state) => state.options.welcomeTour);
  const setOptions = useSynthStore((state) => state.setOptions);

  useEffect(() => {
    if (welcomeTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setOptions({ onboardingVisible: true });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [welcomeTour, setOptions]);

  function nextStep() {
    setCurrentStep((prev) => prev + 1);
  }

  function previousStep() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  function closeOnboarding() {
    setIsVisible(false);
    setOptions({ onboardingVisible: false });
    window.dispatchEvent(new CustomEvent("onboarding-completed"));
  }

  function resetOnboarding() {
    setCurrentStep(0);
    if (welcomeTour) {
      setIsVisible(true);
      setOptions({ onboardingVisible: true });
    }
  }

  function toggleOnboarding() {
    const newValue = !welcomeTour;

    if (newValue === false) {
      setOptions({ welcomeTour: newValue, onboardingVisible: false });
      setIsVisible(false);
    }
  }

  function goToStep(stepIndex: number) {
    setCurrentStep(Math.max(0, Math.min(stepIndex, totalSteps - 1)));
  }

  return {
    isVisible,
    currentStep,
    isOnboardingEnabled: welcomeTour,
    toggleOnboarding,
    nextStep,
    previousStep,
    closeOnboarding,
    resetOnboarding,
    goToStep,
    hasCompletedOnboarding: false,
  };
}
