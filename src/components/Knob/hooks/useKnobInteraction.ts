import { useCallback, useEffect, useState } from "react";
import { calculateValueFromDelta } from "../utils";
import { useKnobKeyboard } from "./useKnobKeyboard";
import { KnobType } from "../types";

type UseKnobInteractionProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  type: KnobType;
  onChange: (value: number) => void;
  logarithmic?: boolean;
  size?: "small" | "medium" | "large";
};

export function useKnobInteraction({
  value,
  min,
  max,
  step,
  type,
  onChange,
  logarithmic = false,
  size,
}: UseKnobInteractionProps) {
  const { knobRef } = useKnobKeyboard({
    value,
    min,
    max,
    step,
    type,
    onChange,
    logarithmic,
    size,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const sensitivity = 1;

  // Detect touch device on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        ("msMaxTouchPoints" in navigator &&
          (navigator as Navigator & { msMaxTouchPoints: number })
            .msMaxTouchPoints > 0);

      setIsTouchDevice(isTouch);
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => {
      window.removeEventListener("resize", checkTouchDevice);
    };
  }, []);

  const updateValue = useCallback(
    (newValue: number) => {
      const now = Date.now();
      // Limit updates to 60fps (16ms)
      if (now - lastUpdateTime < 16) return;

      // Only apply threshold-based updates for arrow knobs
      // Radial knobs should update freely
      if (type === "arrow") {
        const threshold = step < 1 ? step / 10 : 0.1;
        if (Math.abs(newValue - value) < threshold) return;
      }

      setLastUpdateTime(now);
      onChange(newValue);
    },
    [onChange, lastUpdateTime, value, step, type]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent): void => {
      e.preventDefault();
      e.stopPropagation();

      // Focus the knob when clicked and prevent focus loss
      if (knobRef.current) {
        knobRef.current.focus();
        // Prevent the focus from being lost during pointer events
        e.currentTarget.setAttribute("data-focused", "true");
      }

      setIsDragging(true);

      // Set touching state for touch devices
      if (isTouchDevice && e.pointerType === "touch") {
        setIsTouching(true);
      }

      setStartY(e.clientY);
      setStartValue(value);

      // Set pointer capture for better tracking
      if (knobRef.current) {
        knobRef.current.setPointerCapture(e.pointerId);
      }
    },
    [value, knobRef, isTouchDevice]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent): void => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaY = (startY - e.clientY) * sensitivity;
      const newValue = calculateValueFromDelta(
        deltaY,
        startValue,
        1,
        min,
        max,
        step,
        type,
        logarithmic,
        size
      );

      // Only apply threshold-based updates for arrow knobs
      // Radial knobs should update freely
      if (type === "arrow") {
        const threshold = step < 1 ? step / 10 : 0.1;
        if (Math.abs(newValue - value) >= threshold) {
          updateValue(newValue);
        }
      } else {
        updateValue(newValue);
      }
    },
    [
      isDragging,
      startY,
      startValue,
      min,
      max,
      step,
      type,
      logarithmic,
      size,
      value,
      updateValue,
    ]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent): void => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      setIsTouching(false);

      // Release pointer capture and clean up focus attribute
      if (knobRef.current) {
        knobRef.current.releasePointerCapture(e.pointerId);
        knobRef.current.removeAttribute("data-focused");
      }
    },
    [isDragging, knobRef]
  );

  // Set up global event listeners
  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    document.addEventListener("pointerup", handlePointerUp, { passive: false });

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return {
    knobRef,
    isDragging,
    isTouching,
    isTouchDevice,
    handlePointerDown,
  };
}
