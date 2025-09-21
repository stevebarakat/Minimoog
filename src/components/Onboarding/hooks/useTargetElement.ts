import React from "react";
import type { OnboardingStep } from "../types";
import { findTargetElement, scrollElementIntoView } from "../utils";

export function useTargetElement(step: OnboardingStep) {
  const [targetElement, setTargetElement] = React.useState<Element | null>(
    null
  );

  React.useEffect(() => {
    if (!step.target) {
      setTargetElement(null);
      return;
    }

    let mounted = true;

    findTargetElement(step.target).then((element) => {
      if (!mounted) return;

      setTargetElement(element);

      if (element) {
        setTimeout(() => scrollElementIntoView(element), 300);
      }
    });

    return () => {
      mounted = false;
    };
  }, [step.target, step.id]);

  return targetElement;
}
