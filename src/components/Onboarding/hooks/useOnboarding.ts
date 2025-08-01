import { useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Start visible by default

  // Check if user has explicitly dismissed onboarding
  const hasCompletedOnboarding = (() => {
    try {
      return localStorage.getItem("minimoog-onboarding-completed") === "true";
    } catch {
      return false; // If localStorage is not available, show onboarding
    }
  })();

  useEffect(() => {
    // Only hide onboarding if user has explicitly completed it
    if (hasCompletedOnboarding) {
      setIsVisible(false);
    } else {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const skipOnboarding = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("minimoog-onboarding-completed", "true");
    } catch {
      // Ignore localStorage errors
    }
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("minimoog-onboarding-completed", "true");
    } catch {
      // Ignore localStorage errors
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem("minimoog-onboarding-completed");
    } catch {
      // Ignore localStorage errors
    }
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
    hasCompletedOnboarding,
  };
}
