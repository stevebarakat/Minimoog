import { X } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { OnboardingStep, TooltipPosition } from "../types";
import { OnboardingNavigation } from "./OnboardingNavigation";
import styles from "../Onboarding.module.css";
import { useEffect, useState } from "react";

type OnboardingTooltipProps = {
  step: OnboardingStep;
  tooltipPosition: TooltipPosition;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isOnboardingEnabled: boolean;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onGoToStep: (step: number) => void;
  onToggleOnboarding: () => void;
};

export function OnboardingTooltip({
  step,
  tooltipPosition,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  isOnboardingEnabled,
  onSkip,
  onPrevious,
  onNext,
  onComplete,
  onGoToStep,
  onToggleOnboarding,
}: OnboardingTooltipProps) {
  const [prevStep, setPrevStep] = useState(currentStep);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (prevStep !== currentStep) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      setPrevStep(currentStep);
      return () => clearTimeout(timer);
    }
  }, [currentStep, prevStep]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onSkip();
    }, 250);
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onNext();
    }, 200);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onPrevious();
    }, 200);
  };

  const handleGoToStep = (stepIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onGoToStep(stepIndex);
    }, 200);
  };

  return (
    <Tooltip.Root open={true} defaultOpen={true}>
      <Tooltip.Trigger asChild>
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: tooltipPosition.width,
            height: tooltipPosition.height,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={`${styles.tooltip} ${
            isTransitioning ? styles.transitioning : ""
          } ${isExiting ? styles.exiting : ""}`}
          side={isFirstStep ? "bottom" : step.position || "bottom"}
          sideOffset={isFirstStep ? 0 : 10}
          align="center"
          alignOffset={0}
          avoidCollisions={true}
          collisionBoundary={document.body}
          collisionPadding={isFirstStep ? 20 : 10}
        >
          <button
            className={styles.closeButton}
            onClick={handleSkip}
            aria-label="Skip onboarding"
          >
            <X width={24} height={24} />
          </button>
          <div
            className={`${styles.content} ${
              isTransitioning ? styles.transitioning : ""
            }`}
          >
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.description}</p>

            <OnboardingNavigation
              totalSteps={totalSteps}
              currentStep={currentStep}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              isOnboardingEnabled={isOnboardingEnabled}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onComplete={handleComplete}
              onGoToStep={handleGoToStep}
              onToggleOnboarding={onToggleOnboarding}
            />
          </div>
          {!isFirstStep && <Tooltip.Arrow className={styles.arrow} />}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
