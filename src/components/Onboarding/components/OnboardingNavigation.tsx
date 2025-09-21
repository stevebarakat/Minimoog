import Button from "@/components/Button";
import { cn } from "@/utils";
import styles from "../Onboarding.module.css";
import buttonStyles from "@/components/Button/Button.module.css";

type OnboardingNavigationProps = {
  totalSteps: number;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isOnboardingEnabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onGoToStep: (step: number) => void;
  onToggleOnboarding: () => void;
};

export function OnboardingNavigation({
  totalSteps,
  currentStep,
  isFirstStep,
  isLastStep,
  isOnboardingEnabled,
  onPrevious,
  onNext,
  onComplete,
  onGoToStep,
  onToggleOnboarding,
}: OnboardingNavigationProps) {
  function handleDotKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onGoToStep(index);
    }
  }

  function handleChange() {
    onGoToStep(0);
    onToggleOnboarding();
  }

  return (
    <div className={styles.navigation}>
      <div className={styles.progress}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={cn(
              styles.dot,
              index === currentStep && styles.active,
              index < currentStep && styles.completed
            )}
            onClick={() => onGoToStep(index)}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={`Go to step ${index + 1}`}
            onKeyDown={(e) => handleDotKeyDown(e, index)}
          />
        ))}
      </div>

      <div className={styles.buttons}>
        {!isFirstStep && (
          <Button
            className={cn(buttonStyles.button, buttonStyles.secondary)}
            onClick={onPrevious}
          >
            Prev
          </Button>
        )}

        {isLastStep ? (
          <Button
            className={cn(buttonStyles.button, buttonStyles.secondary)}
            onClick={onComplete}
          >
            Get Started
          </Button>
        ) : (
          <Button
            className={cn(buttonStyles.button, buttonStyles.secondary)}
            onClick={onNext}
          >
            Next
          </Button>
        )}
      </div>

      {isLastStep && (
        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              checked={!isOnboardingEnabled}
              onChange={handleChange}
            />
            Don't show this again
          </label>
        </div>
      )}
    </div>
  );
}
