import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { createPortal } from "react-dom";
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
    id: "power",
    title: "Start by turning on the power",
    description:
      "The Minimoog needs to be powered on before you can create any sounds. Flip the power switch to get started.",
    target: "[data-onboarding='power']",
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
        console.log(
          `Onboarding: Found target element for step ${step.id}:`,
          element
        );
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
            rect: el.getBoundingClientRect(),
          }))
        );
        setTargetElement(null);
      }
    };

    findTarget();
  }, [step.target, currentStep]);

  // Early return after all hooks have been called
  if (!isVisible) return null;

  // Don't render if we're looking for a target element but haven't found it yet
  if (step.target && !targetElement) {
    return null;
  }

  const renderTooltip = () => (
    <Tooltip.Provider>
      <Tooltip.Root open={true} defaultOpen={true}>
        <Tooltip.Trigger asChild>
          <div
            style={{
              position: "fixed",
              top: targetElement
                ? targetElement.getBoundingClientRect().top
                : "50%",
              left: targetElement
                ? targetElement.getBoundingClientRect().left
                : "50%",
              width: targetElement
                ? targetElement.getBoundingClientRect().width
                : "1px",
              height: targetElement
                ? targetElement.getBoundingClientRect().height
                : "1px",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={styles.tooltip}
            side={step.position || "bottom"}
            sideOffset={10}
            align="center"
            alignOffset={0}
            avoidCollisions={true}
            collisionBoundary={document.body}
            collisionPadding={10}
          >
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
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  // Render tooltip in a portal to ensure proper positioning
  return createPortal(renderTooltip(), document.body);
}

export default Onboarding;
