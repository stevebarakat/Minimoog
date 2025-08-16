import React, { useRef } from "react";
import { getRotation, getDisplayValue } from "./utils";
import { useKnobInteraction } from "./hooks";
import { KnobTicks, KnobLabels, KnobRing } from "./components";
import { KnobProps } from ".";
import styles from "./Knob.module.css";
import { cn, slugify } from "@/utils";

type PushPullProps = {
  pushPull?: boolean; // enables push/pull mode
  pushPullValue?: boolean; // true = pulled, false = pushed
  onPushPullChange?: (newValue: boolean) => void; // toggle callback
};

type Props = KnobProps &
  PushPullProps & {
    id?: string; // optional custom ID for unique ARIA identifiers
  };

const Knob = React.memo(function Knob({
  value,
  min,
  max,
  step = 1,
  label,
  title = "",
  unit = "",
  onChange,
  valueLabels,
  size = "medium",
  showMidTicks = true,
  type = "radial",
  logarithmic = false,
  style,
  disabled = false,
  pushPull = false,
  pushPullValue = false,
  onPushPullChange,
  id: customId,
}: Props) {
  const { knobRef, isTouching, handlePointerDown } = useKnobInteraction({
    value,
    min,
    max,
    step,
    type,
    onChange,
    logarithmic,
    size,
  });

  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pushPull || !onPushPullChange) return;
    if (!pointerStart.current) return;

    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);

    // Treat as a click if minimal movement
    if (dx < 5 && dy < 5) {
      onPushPullChange(!pushPullValue);
    }
    pointerStart.current = null;
  };

  const handlePointerDownWithTrack = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    handlePointerDown(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!pushPull || !onPushPullChange) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onPushPullChange(!pushPullValue);
    }
  };

  const id = customId || slugify(label);
  const labelClass = title ? styles.labelHidden : styles.label;
  const rotation = getRotation(value, min, max, type, logarithmic);
  const displayValue = getDisplayValue(value, step, unit, valueLabels);
  const ariaValueText =
    typeof displayValue === "string"
      ? displayValue
      : value.toFixed(step >= 1 ? 0 : 2) + (unit ? ` ${unit}` : "");

  // Enhanced aria description for push/pull knobs
  const ariaDescription = pushPull
    ? `${label} knob. Current value: ${ariaValueText}. Push/pull state: ${
        pushPullValue ? "pulled" : "pushed"
      }. Use arrow keys to adjust value, space or enter to toggle push/pull.`
    : `${label} knob. Current value: ${ariaValueText}. Use arrow keys to adjust value.`;

  const knobElement = (
    <div
      style={style}
      className={cn(
        styles.knobContainer,
        styles[`knobContainer${size.charAt(0).toUpperCase() + size.slice(1)}`],
        isTouching && styles.touching
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          labelClass,
          styles[`label${size.charAt(0).toUpperCase() + size.slice(1)}`]
        )}
      >
        {label}
      </label>

      {title && (
        <span
          className={cn(
            styles.title,
            styles[`title${size.charAt(0).toUpperCase() + size.slice(1)}`]
          )}
        >
          {title}
        </span>
      )}

      <div className={styles.knob}>
        <KnobRing type={type === "attackDecay" ? "radial" : type} />

        {valueLabels && (
          <KnobTicks
            valueLabels={valueLabels}
            min={min}
            max={max}
            type={type}
            showMidTicks={showMidTicks}
          />
        )}

        {valueLabels && (
          <KnobLabels
            valueLabels={valueLabels}
            min={min}
            max={max}
            type={type}
            size={size}
          />
        )}

        <div className={styles.knobOutline}>
          <div
            id={id}
            className={cn(
              type === "radial" || type === "attackDecay"
                ? styles.radial
                : styles.arrow,
              disabled && "disabled",
              pushPull &&
                (pushPullValue ? styles.knobPulled : styles.knobPushed),
              isTouching && styles.touching
            )}
            ref={knobRef}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
            onPointerDown={disabled ? undefined : handlePointerDownWithTrack}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label={label}
            aria-valuetext={ariaValueText}
            aria-description={ariaDescription}
          >
            <div className={styles.dot} />
          </div>
        </div>
      </div>
    </div>
  );

  return knobElement;
});

export default Knob;
