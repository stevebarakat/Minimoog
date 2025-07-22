import { getRotation, getDisplayValue } from "./utils";
import { useKnobInteraction } from "./hooks";
import { KnobTicks, KnobLabels, KnobRing } from "./components";
import { KnobProps } from "./types";
import styles from "./Knob.module.css";
import { cn } from "@/utils/helpers";
import { slugify } from "@/utils/";

function Knob({
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
}: KnobProps) {
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

  const id = slugify(label);
  const labelClass = title ? styles.labelHidden : styles.label;
  const rotation = getRotation(value, min, max, type, logarithmic);
  const displayValue = getDisplayValue(value, step, unit, valueLabels);
  const ariaValueText =
    typeof displayValue === "string"
      ? displayValue
      : value.toFixed(step >= 1 ? 0 : 2) + (unit ? ` ${unit}` : "");

  return (
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
        <KnobRing type={type} />
        {/* Tick marks around the knob */}
        {valueLabels && (
          <KnobTicks
            valueLabels={valueLabels}
            min={min}
            max={max}
            type={type}
            showMidTicks={showMidTicks}
          />
        )}

        {/* Value labels around the knob */}
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
            className={
              type === "arrow"
                ? cn(styles.arrow, disabled && styles.disabled)
                : cn(styles.radial, disabled && styles.disabled)
            }
            ref={knobRef}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
            onPointerDown={disabled ? undefined : handlePointerDown}
            tabIndex={0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label={label}
            aria-valuetext={ariaValueText}
          >
            <div className={styles.dot} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Knob;
