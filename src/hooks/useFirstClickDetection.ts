import { useEffect, useRef, useCallback } from "react";

type UseFirstClickDetectionProps = {
  onFirstClick: () => void;
  enabled?: boolean;
};

export function useFirstClickDetection({
  onFirstClick,
  enabled = true,
}: UseFirstClickDetectionProps) {
  const hasTriggered = useRef(false);

  const handleFirstInteraction = useCallback(
    (event: Event) => {
      console.log("First click detection triggered:", event.type, event.target);

      if (!enabled || hasTriggered.current) {
        console.log(
          "Skipping - enabled:",
          enabled,
          "hasTriggered:",
          hasTriggered.current
        );
        return;
      }

      const target = event.target as HTMLElement;
      const isInteractiveElement =
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "LABEL" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("label") ||
        target.closest('[role="button"]') ||
        target.closest("[tabindex]");

      const isKeyboardKey =
        target.closest('[data-testid^="key-"]') ||
        target.closest('[aria-label*="Piano key"]');

      console.log(
        "isInteractiveElement:",
        isInteractiveElement,
        "isKeyboardKey:",
        isKeyboardKey
      );

      if (!isInteractiveElement || isKeyboardKey) {
        console.log("Triggering onFirstClick");
        hasTriggered.current = true;
        onFirstClick();
      } else {
        console.log(
          "Not triggering - interactive element and not keyboard key"
        );
      }
    },
    [enabled, onFirstClick]
  );

  useEffect(() => {
    if (!enabled) return;

    console.log("Setting up first click detection listeners");

    const options = { passive: true };

    const handleEvent = (event: Event) => {
      if (hasTriggered.current) return;
      handleFirstInteraction(event);
    };

    document.addEventListener("pointerdown", handleEvent, options);
    document.addEventListener("touchstart", handleEvent, options);
    document.addEventListener("touchend", handleEvent, options);
    document.addEventListener("click", handleEvent, options);

    return () => {
      console.log("Cleaning up first click detection listeners");
      document.removeEventListener("pointerdown", handleEvent);
      document.removeEventListener("touchstart", handleEvent);
      document.removeEventListener("touchend", handleEvent);
      document.removeEventListener("click", handleEvent);
    };
  }, [enabled, handleFirstInteraction]);

  return {
    hasTriggered: hasTriggered.current,
  };
}
