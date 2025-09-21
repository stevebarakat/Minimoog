import styles from "./RockerSwitch.module.css";
import { slugify, cn } from "@/utils";
import { useRockerSwitchKeyboard } from "./hooks";
import { useEffect, useRef, useCallback } from "react";
import { usePowerRequiredToast } from "@/hooks/usePowerRequiredToast";

type RockerSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  topLabelLeft?: string | React.ReactElement;
  topLabel?: string | React.ReactElement;
  topLabelRight?: string | React.ReactElement;
  leftLabel?: string | React.ReactElement;
  bottomLabelLeft?: string | React.ReactElement;
  bottomLabel?: string | React.ReactElement;
  bottomLabelRight?: string | React.ReactElement;
  theme?: "black" | "orange" | "blue" | "white";
  style?: React.CSSProperties;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  testid?: string;
  autoFocus?: boolean;
};

function RockerSwitch({
  checked,
  onCheckedChange,
  label = "",
  theme = "black",
  topLabelLeft,
  topLabel,
  topLabelRight,
  leftLabel,
  bottomLabelLeft,
  bottomLabel,
  bottomLabelRight,
  style,
  orientation = "horizontal",
  disabled = false,
  testid,
  autoFocus = false,
}: RockerSwitchProps) {
  // Covert label to slug for id
  const id = slugify(label);

  const { showPowerRequiredToast } = usePowerRequiredToast();

  // Add keyboard handling for spacebar toggle
  const { switchRef } = useRockerSwitchKeyboard({
    checked,
    onCheckedChange,
    disabled,
  });

  // Track focus state that persists across re-renders
  const wasFocusedRef = useRef(false);

  // Track re-renders and focus state
  useEffect(() => {
    // If we had focus before the re-render, try to restore it
    if (wasFocusedRef.current && switchRef.current) {
      // Use requestAnimationFrame to ensure DOM is stable
      requestAnimationFrame(() => {
        if (switchRef.current && document.activeElement !== switchRef.current) {
          switchRef.current.focus();
        }
      });
    }
  });

  // Handle auto focus using ref callback
  const handleSwitchRef = useCallback(
    (element: HTMLLabelElement | null) => {
      switchRef.current = element;
      if (autoFocus && element && !disabled) {
        element.focus();
        wasFocusedRef.current = true;
      }
    },
    [autoFocus, disabled, switchRef]
  );
  const topLabels = [topLabelLeft, topLabel, topLabelRight].filter(
    (label) => label !== undefined
  ) as string[];
  const bottomLabels = [bottomLabelLeft, bottomLabel, bottomLabelRight].filter(
    (label) => label !== undefined
  ) as string[];

  function TopLabels({ topLabels }: { topLabels: string[] }) {
    if (topLabels.length === 0) return null;

    return (
      <div className={styles.topLabel}>
        {topLabelLeft && <span className={styles.left}>{topLabelLeft}</span>}
        {topLabel && (
          <span
            className={styles.center}
            style={{
              backdropFilter:
                orientation === "vertical" ? "none" : "blur(10px)",
            }}
          >
            {topLabel}
          </span>
        )}
        {topLabelRight && <span className={styles.right}>{topLabelRight}</span>}
      </div>
    );
  }

  function LeftLabel({
    leftLabel,
  }: {
    leftLabel: string | React.ReactElement | undefined;
  }) {
    if (!leftLabel) return null;
    return <span className={styles.leftLabel}>{leftLabel}</span>;
  }

  function BottomLabels({ bottomLabels }: { bottomLabels: string[] }) {
    if (bottomLabels.length === 0) return null;

    return (
      <div className={styles.bottomLabel}>
        {bottomLabelLeft && (
          <span className={styles.left}>{bottomLabelLeft}</span>
        )}
        {bottomLabel && (
          <span className={cn(styles.center, styles[`${orientation}Label`])}>
            {bottomLabel}
          </span>
        )}
        {bottomLabelRight && (
          <span className={styles.right}>{bottomLabelRight}</span>
        )}
      </div>
    );
  }

  function Switch({ testid }: { testid: string }) {
    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      // Focus the switch when clicked
      if (switchRef.current) {
        switchRef.current.focus();
        wasFocusedRef.current = true;
      }
    };

    const handleClick = () => {
      // Ensure focus is maintained after click
      // Use requestAnimationFrame to ensure DOM is stable after state changes
      requestAnimationFrame(() => {
        if (switchRef.current && document.activeElement !== switchRef.current) {
          switchRef.current.focus();
          wasFocusedRef.current = true;
        }
      });
    };

    const handleBlur = () => {
      // Track when focus is lost
      wasFocusedRef.current = false;
    };

    return (
      <label
        htmlFor={id}
        ref={handleSwitchRef}
        tabIndex={0}
        onPointerDown={disabled ? showPowerRequiredToast : handlePointerDown}
        onClick={handleClick}
        onBlur={handleBlur}
      >
        <input
          id={id}
          data-testid={testid}
          disabled={disabled}
          className={styles.state}
          type="checkbox"
          onChange={(e) => !disabled && onCheckedChange(e.target.checked)}
          checked={checked}
        />
        <div
          className={cn(styles.switch, disabled && "disabled")}
          role="button"
          aria-pressed={checked}
          aria-label={label}
        >
          <span className="sr-only">{label}</span>
        </div>
      </label>
    );
  }

  const switchElement = (
    <div className={cn(styles[orientation], styles[theme])} style={style}>
      <TopLabels topLabels={topLabels} />

      <LeftLabel leftLabel={leftLabel} />

      <Switch testid={testid || ""} />

      <BottomLabels bottomLabels={bottomLabels} />
    </div>
  );

  return switchElement;
}

export default RockerSwitch;
