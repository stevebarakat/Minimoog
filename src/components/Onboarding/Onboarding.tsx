import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { createPortal } from "react-dom";
import styles from "./Onboarding.module.css";
import { cn } from "@/utils";
import { useOnboarding } from "./hooks/useOnboarding";
import { useIsMobile } from "@/hooks/useMediaQuery";

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
      "The Minimoog needs to be powered on before you can use it. Flip the power switch to get started.",
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
    id: "filter-envelope",
    title: "Filter Envelope",
    description:
      "Shape your filter over time. The Filter Envelope controls how the filter cutoff changes when you press a key. Adjust Attack, Decay, Sustain, and Release to create dynamic filter sweeps.",
    target: "[data-onboarding='filter-envelope']",
    position: "bottom",
  },
  {
    id: "loudness-envelope",
    title: "Loudness Envelope",
    description:
      "Control the volume shape of your sound. The Loudness Envelope determines how the overall volume changes over time. Use this to create percussive or sustained sounds.",
    target: "[data-onboarding='loudness-envelope']",
    position: "bottom",
  },
  {
    id: "controllers",
    title: "Controllers",
    description:
      "Fine-tune your sound with the controllers. Tune adjusts the overall pitch, Glide creates smooth transitions between notes, and Modulation Mix controls the intensity of modulation effects.",
    target: "[data-onboarding='controllers']",
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
      "Load classic Minimoog presets to get you started. Choose from a variety of iconic sounds that showcase the synthesizer's capabilities.",
    target: "[data-onboarding='presets']",
    position: "bottom",
  },
  {
    id: "copy-settings",
    title: "Copy Settings",
    description:
      "Share your patches with others! Click 'Copy Settings' to generate a URL with your current settings. Anyone with the link can load your exact patch.",
    target: "[data-onboarding='copy-settings']",
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
    isOnboardingEnabled,
    toggleOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    goToStep,
  } = useOnboarding(ONBOARDING_STEPS.length);

  const [targetElement, setTargetElement] = React.useState<Element | null>(
    null
  );
  const [viewportSize, setViewportSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isMobile = useIsMobile();

  // Handle viewport resize with event handlers
  const updateViewportSize = React.useCallback(() => {
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Use useEffect only for external DOM event listeners (window resize)
  React.useEffect(() => {
    // Update on initial load
    updateViewportSize();

    // Update on resize
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [updateViewportSize]);

  // Function to scroll target element into view
  const scrollToElement = React.useCallback((element: Element) => {
    // Find the scrollable container (controls panel)
    const controlsPanel = document.querySelector(
      '[data-onboarding="controls-panel"]'
    );
    if (controlsPanel && controlsPanel instanceof HTMLElement) {
      // Wait a bit for any layout changes to settle
      requestAnimationFrame(() => {
        // Calculate the scroll position to center the element
        const containerRect = controlsPanel.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate the scroll offset to center the element
        const scrollLeft =
          elementRect.left +
          elementRect.width / 2 -
          containerRect.left -
          containerRect.width / 2;

        // Smooth scroll to the element
        controlsPanel.scrollTo({
          left: controlsPanel.scrollLeft + scrollLeft,
          behavior: "smooth",
        });
      });
    }
  }, []);

  // Find the target element for the current step with retry mechanism
  const findTargetElement = React.useCallback(() => {
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

        // Scroll the element into view with a longer delay to ensure positioning
        setTimeout(() => scrollToElement(element), 300);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findTarget, 100);
      } else {
        // Give up after max retries, show tooltip in center
        console.warn(
          `Onboarding: Target element not found for step ${step.id} after ${maxRetries} retries`
        );

        setTargetElement(null);
      }
    };

    findTarget();
  }, [step.target, step.id, scrollToElement]);

  // Use useEffect only for external DOM querying (target element finding)
  React.useEffect(() => {
    findTargetElement();
  }, [findTargetElement, currentStep, viewportSize]);

  // Handle scroll events with event handlers
  const handleScroll = React.useCallback(() => {
    // Force a re-render by updating viewport size
    setViewportSize((prev) => ({ ...prev }));
  }, []);

  // Use useEffect only for external DOM event listeners (scroll events)
  React.useEffect(() => {
    const findControlsPanel = () => {
      return document.querySelector('[data-onboarding="controls-panel"]');
    };

    const controlsPanel = findControlsPanel();
    if (!controlsPanel) {
      // If not found immediately, try again after a short delay
      const timeoutId = setTimeout(() => {
        const panel = findControlsPanel();
        if (!panel) return;

        panel.addEventListener("scroll", handleScroll);
        return () => panel.removeEventListener("scroll", handleScroll);
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    controlsPanel.addEventListener("scroll", handleScroll);
    return () => controlsPanel.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Early return after all hooks have been called
  if (!isVisible) return null;

  // Don't render if we're looking for a target element but haven't found it yet
  if (step.target && !targetElement) {
    return null;
  }

  // Calculate responsive positioning based on viewport size
  const getTooltipPosition = () => {
    // For the first step, center the tooltip relative to the Minimoog synth
    if (isFirstStep) {
      const minimoogContainer = document.querySelector('[class*="synth"]');
      if (minimoogContainer) {
        const rect = minimoogContainer.getBoundingClientRect();
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width / 2}px`,
          width: "1px",
          height: "1px",
        };
      }
      // Fallback to viewport center if Minimoog container not found
      return {
        top: "50%",
        left: "50%",
        width: "1px",
        height: "1px",
      };
    }

    if (!targetElement) {
      return {
        top: "50%",
        left: "50%",
        width: "1px",
        height: "1px",
      };
    }

    const rect = targetElement.getBoundingClientRect();

    // Adjust positioning based on screen size
    let top = rect.top;
    let left = rect.left;
    const width = rect.width;
    const height = rect.height;

    // On mobile, ensure elements are visible
    if (isMobile) {
      // Ensure element is within viewport bounds
      if (rect.left < 0) left = 10;
      if (rect.right > viewportSize.width)
        left = viewportSize.width - width - 10;
      if (rect.top < 0) top = 10;
      if (rect.bottom > viewportSize.height)
        top = viewportSize.height - height - 10;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const tooltipPosition = getTooltipPosition();

  const renderTooltip = () => (
    <Tooltip.Provider>
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
            className={styles.tooltip}
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
              onClick={skipOnboarding}
              aria-label="Skip onboarding"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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
                      onClick={() => goToStep(index)}
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Go to step ${index + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToStep(index);
                        }
                      }}
                    />
                  ))}
                </div>

                <div className={styles.buttons}>
                  {!isFirstStep && (
                    <button className={styles.button} onClick={previousStep}>
                      Prev
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
                </div>
                {isLastStep && (
                  <div className={styles.checkbox}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!isOnboardingEnabled}
                        onChange={toggleOnboarding}
                      />
                      Don't show this again
                    </label>
                  </div>
                )}
              </div>
            </div>
            {!isFirstStep && !isLastStep && (
              <Tooltip.Arrow className={styles.arrow} />
            )}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  // Render tooltip in a portal to ensure proper positioning
  return createPortal(renderTooltip(), document.body);
}

export default Onboarding;
