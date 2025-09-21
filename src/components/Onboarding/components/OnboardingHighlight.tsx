import { useEffect, useState } from "react";
import styles from "../Onboarding.module.css";

type OnboardingHighlightProps = {
  targetElement: Element;
  currentStep: number;
};

export function OnboardingHighlight({
  targetElement,
  currentStep,
}: OnboardingHighlightProps) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      });
    };

    // Initial position update
    updatePosition();

    // Show highlight with animation
    setIsVisible(true);

    // Update position on scroll/resize
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetElement, currentStep]);

  if (!isVisible) return null;

  return (
    <div
      className={styles.highlight}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
