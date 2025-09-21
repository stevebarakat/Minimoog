import { createPortal } from "react-dom";
import { useOnboarding } from "./hooks/useOnboarding";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTargetElement } from "./hooks/useTargetElement";
import { useViewportTracking } from "./hooks/useViewportTracking";
import { OnboardingTooltip } from "./components/OnboardingTooltip";
import { OnboardingHighlight } from "./components/OnboardingHighlight";
import { ONBOARDING_STEPS } from "./data";
import { calculateTooltipPosition } from "./utils";

export function Onboarding() {
  const {
    isVisible,
    currentStep,
    isOnboardingEnabled,
    toggleOnboarding,
    nextStep,
    previousStep,
    closeOnboarding,
    goToStep,
  } = useOnboarding(ONBOARDING_STEPS.length);

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const targetElement = useTargetElement(step);
  const viewportSize = useViewportTracking();
  const isMobile = useIsMobile();

  if (!isVisible) return null;

  if (step.target && !targetElement) {
    return null;
  }

  const tooltipPosition = calculateTooltipPosition(
    targetElement,
    isFirstStep,
    viewportSize
  );

  return isMobile
    ? null
    : createPortal(
        <>
          {targetElement && !isFirstStep && (
            <OnboardingHighlight
              targetElement={targetElement}
              currentStep={currentStep}
            />
          )}
          <OnboardingTooltip
            step={step}
            tooltipPosition={tooltipPosition}
            currentStep={currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isOnboardingEnabled={isOnboardingEnabled}
            onSkip={closeOnboarding}
            onPrevious={previousStep}
            onNext={nextStep}
            onComplete={closeOnboarding}
            onGoToStep={goToStep}
            onToggleOnboarding={toggleOnboarding}
          />
        </>,
        document.body
      );
}

export default Onboarding;
