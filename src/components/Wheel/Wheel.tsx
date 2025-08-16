import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Wheel.module.css";
import { slugify } from "@/utils";
import { cn } from "@/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

type ModWheelProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onMouseUp?: () => void;
  label?: string;
  isDisabled?: boolean;
};

function calculatePercentage(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

function calculateWheelValueFromPosition(
  y: number,
  rectHeight: number,
  min: number,
  max: number,
  step: number
): number {
  const verticalPercentage = Math.max(
    0,
    Math.min(100, (1 - y / rectHeight) * 100)
  );
  const linearValue = min + ((max - min) * verticalPercentage) / 100;
  const steppedValue = Math.round(linearValue / step) * step;
  return Math.max(min, Math.min(max, steppedValue));
}

const Wheel = React.memo(function Wheel({
  value,
  min,
  max,
  step = 1,
  onChange,
  onMouseUp,
  label = "Mod",
  isDisabled = false,
}: ModWheelProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const percentage = calculatePercentage(value, min, max);
  const isMobile = useIsMobile();
  const id = slugify(label);

  function handleMouseDown(e: React.MouseEvent): void {
    setIsDragging(true);
    handleMouseMove(e);
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent): void => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const newValue = calculateWheelValueFromPosition(
        y,
        rect.height,
        min,
        max,
        step
      );
      onChange(newValue);
    },
    [isDragging, min, max, onChange, step]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      const isShiftPressed = e.shiftKey;
      const multiplier = isShiftPressed ? 10 : 1;
      const stepSize = step * multiplier;

      let newValue = value;

      switch (e.key) {
        case "ArrowUp":
          newValue = Math.min(max, value + stepSize);
          break;
        case "ArrowDown":
          newValue = Math.max(min, value - stepSize);
          break;
        default:
          return;
      }

      onChange(Math.max(min, Math.min(max, newValue)));
    },
    [max, min, onChange, step, value]
  );

  useEffect(() => {
    function handleMouseUp(): void {
      setIsDragging(false);
      onMouseUp?.();
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, onMouseUp, isDragging]);

  const wheelElement = (
    <div className={cn(styles.wheelContainer, isDisabled && styles.disabled)}>
      <div
        id={id}
        ref={sliderRef}
        className={styles.wheel}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        style={{ "--thumb-position": `${percentage}%` } as React.CSSProperties}
        tabIndex={0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        aria-disabled={isDisabled}
      >
        <div
          className={styles.track}
          style={{ cursor: isDisabled ? "not-allowed" : "unset" }}
        >
          {!isMobile && <div className={styles.shadow} />}
        </div>
        <div className={styles.thumb} />
      </div>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
    </div>
  );

  return wheelElement;
});

export default Wheel;
