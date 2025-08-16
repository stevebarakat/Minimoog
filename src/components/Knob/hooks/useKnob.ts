import { useCallback, useEffect, useRef } from "react";
import { calculateValueFromDelta } from "../utils";
import { shouldInterceptKeyboardEvent } from "@/utils";
import { KnobType } from "..";

type UseKnobKeyboardProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  type: KnobType;
  onChange: (value: number) => void;
  logarithmic?: boolean;
  size?: "small" | "medium" | "large";
};

export function useKnob({
  value,
  min,
  max,
  step,
  type,
  onChange,
  logarithmic = false,
  size,
}: UseKnobKeyboardProps) {
  const knobRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      // Check if the active element is the knob, if the knob contains the active element,
      // or if the knob has the data-focused attribute (fallback for pointer events)
      if (
        document.activeElement !== knobRef.current &&
        !knobRef.current?.contains(document.activeElement) &&
        knobRef.current?.getAttribute("data-focused") !== "true"
      )
        return;

      // Respect modifier keys for browser shortcuts
      if (!shouldInterceptKeyboardEvent(e)) return;

      const isShiftPressed = e.shiftKey;
      const multiplier = isShiftPressed ? 10 : 1;
      const stepSize = step * multiplier;
      const keyboardStepSize = stepSize * 10;

      let newValue = value;

      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
          newValue = calculateValueFromDelta(
            keyboardStepSize,
            value,
            1,
            min,
            max,
            step,
            type,
            logarithmic,
            size
          );
          break;
        case "ArrowDown":
        case "ArrowLeft":
          newValue = calculateValueFromDelta(
            -keyboardStepSize,
            value,
            1,
            min,
            max,
            step,
            type,
            logarithmic,
            size
          );
          break;
        default:
          return;
      }

      // Only apply step snapping for arrow knobs
      if (type === "arrow") {
        newValue = Number(newValue.toFixed(step >= 1 ? 0 : 2));
      }

      onChange(newValue);
    },
    [value, min, max, step, type, onChange, logarithmic, size]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { knobRef };
}
