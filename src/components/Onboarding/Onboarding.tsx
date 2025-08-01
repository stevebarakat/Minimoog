import React from "react";
import styles from "./Onboarding.module.css";
import { cn } from "@/utils";
import { useOnboarding } from "./hooks/useOnboarding";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: "top" | "bottom" | "left" | "right";
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Minimoog!",
    description:
      "This is a faithful recreation of the legendary Minimoog Model D synthesizer. Let's take a quick tour to get you started.",
    position: "bottom",
  },
  {
    id: "oscillators",
    title: "Oscillators",
    description:
      "These three oscillators are the heart of the Minimoog. Each can produce different waveforms and frequencies to create rich, complex sounds.",
    target: "[data-onboarding='oscillators']",
    position: "bottom",
  },
  {
    id: "mixer",
    title: "Mixer",
    description:
      "The mixer controls the volume of each oscillator, noise, and external input. Balance them to create your desired sound.",
    target: "[data-onboarding='mixer']",
    position: "bottom",
  },
  {
    id: "filter",
    title: "Filter",
    description:
      "The legendary Moog filter shapes your sound. Cutoff controls the brightness, while emphasis adds resonance.",
    target: "[data-onboarding='filter']",
    position: "bottom",
  },
  {
    id: "envelopes",
    title: "Envelopes",
    description:
      "Envelopes control how your sound changes over time. The filter envelope shapes the filter, while the loudness envelope controls volume.",
    target: "[data-onboarding='envelopes']",
    position: "bottom",
  },
  {
    id: "modulation",
    title: "Modulation",
    description:
      "The modulation section adds movement to your sound. Use the LFO and modulation wheel to create dynamic, evolving patches.",
    target: "[data-onboarding='modulation']",
    position: "bottom",
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description:
      "Play the keyboard to hear your patch. Use the pitch and modulation wheels for expressive control.",
    target: "[data-onboarding='keyboard']",
    position: "top",
  },
  {
    id: "presets",
    title: "Presets",
    description:
      "Save and load your favorite patches. The Minimoog comes with classic presets to get you started.",
    target: "[data-onboarding='presets']",
    position: "bottom",
  },
  {
    id: "complete",
    title: "You're Ready!",
    description:
      "You now know the basics of the Minimoog. Start exploring and creating your own unique sounds!",
    position: "bottom",
  },
];

export function Onboarding() {
  const {
    isVisible,
    currentStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const [targetElement, setTargetElement] = React.useState<Element | null>(
    null
  );

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  // Find the target element for the current step with retry mechanism
  React.useEffect(() => {
    if (!step.target) {
      setTargetElement(null);
      return;
    }

    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max

    const findTarget = () => {
      const element = document.querySelector(step.target!);
      if (element) {
        setTargetElement(element);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findTarget, 100);
      } else {
        // Give up after max retries, show tooltip in center
        console.warn(
          `Onboarding: Target element not found for step ${step.id} after ${maxRetries} retries`
        );
        // Debug: log all data-onboarding elements
        const allOnboardingElements =
          document.querySelectorAll("[data-onboarding]");
        console.log(
          "Available onboarding elements:",
          Array.from(allOnboardingElements).map((el) => ({
            selector: el.getAttribute("data-onboarding"),
            tagName: el.tagName,
            className: el.className,
          }))
        );
        setTargetElement(null);
      }
    };

    findTarget();
  }, [step.target, currentStep]);

  // Don't render if we're looking for a target element but haven't found it yet
  if (step.target && !targetElement) {
    return null;
  }

  // Calculate position relative to target element
  const getTooltipPosition = () => {
    if (!targetElement) {
      // For welcome step or when target not found, position in center
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = step.position || "bottom";

    // Ensure the tooltip stays within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 350; // Approximate tooltip width
    const tooltipHeight = 200; // Approximate tooltip height

    let top, left, transform;

    switch (position) {
      case "top":
        top = Math.max(10, rect.top - 20);
        left = Math.max(
          10,
          Math.min(
            viewportWidth - tooltipWidth - 10,
            rect.left + rect.width / 2
          )
        );
        transform = "translateX(-50%)";
        break;
      case "bottom":
        top = Math.min(viewportHeight - tooltipHeight - 10, rect.bottom + 20);
        left = Math.max(
          10,
          Math.min(
            viewportWidth - tooltipWidth - 10,
            rect.left + rect.width / 2
          )
        );
        transform = "translateX(-50%)";
        break;
      case "left":
        top = Math.max(
          10,
          Math.min(
            viewportHeight - tooltipHeight - 10,
            rect.top + rect.height / 2
          )
        );
        left = Math.max(10, rect.left - 20);
        transform = "translateY(-50%)";
        break;
      case "right":
        top = Math.max(
          10,
          Math.min(
            viewportHeight - tooltipHeight - 10,
            rect.top + rect.height / 2
          )
        );
        left = Math.min(viewportWidth - tooltipWidth - 10, rect.right + 20);
        transform = "translateY(-50%)";
        break;
      default:
        top = Math.min(viewportHeight - tooltipHeight - 10, rect.bottom + 20);
        left = Math.max(
          10,
          Math.min(
            viewportWidth - tooltipWidth - 10,
            rect.left + rect.width / 2
          )
        );
        transform = "translateX(-50%)";
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <div className={styles.tooltip} style={tooltipStyle}>
      <div className={styles.content}>
        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.description}>{step.description}</p>

        <div className={styles.navigation}>
          <div className={styles.progress}>
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  styles.dot,
                  index === currentStep && styles.active,
                  index < currentStep && styles.completed
                )}
              />
            ))}
          </div>

          <div className={styles.buttons}>
            {!isFirstStep && (
              <button className={styles.button} onClick={previousStep}>
                Previous
              </button>
            )}

            {isLastStep ? (
              <button
                className={cn(styles.button, styles.primary)}
                onClick={completeOnboarding}
              >
                Get Started
              </button>
            ) : (
              <button
                className={cn(styles.button, styles.primary)}
                onClick={nextStep}
              >
                Next
              </button>
            )}

            <button
              className={cn(styles.button, styles.skip)}
              onClick={skipOnboarding}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
