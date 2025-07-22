import styles from "./RockerSwitch.module.css";
import { slugify, cn } from "@/utils";
import { useRockerSwitchKeyboard } from "./hooks";
import { useEffect, useRef } from "react";

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
}: RockerSwitchProps) {
  // Covert label to slug for id
  const id = slugify(label);

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
    if (wasFocusedRef.current) {
      setTimeout(() => {
        if (switchRef.current) {
          switchRef.current.focus();
          switchRef.current.setAttribute("data-focused", "true");
        }
      }, 0);
    }
  });
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

  function Switch() {
    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();

      // Focus the switch when clicked and prevent focus loss
      if (switchRef.current) {
        switchRef.current.focus();
        // Prevent the focus from being lost during pointer events
        e.currentTarget.setAttribute("data-focused", "true");
        wasFocusedRef.current = true;
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      // Ensure focus is maintained after click
      if (switchRef.current) {
        switchRef.current.focus();
        e.currentTarget.setAttribute("data-focused", "true");
        wasFocusedRef.current = true;
      }
    };

    const handleBlur = () => {
      // Clean up the data-focused attribute when focus is lost
      // Add a small delay to prevent immediate cleanup during focus transitions
      setTimeout(() => {
        if (
          switchRef.current &&
          !switchRef.current.contains(document.activeElement)
        ) {
          switchRef.current.removeAttribute("data-focused");
          wasFocusedRef.current = false;
        }
      }, 10);
    };

    return (
      <label
        htmlFor={id}
        ref={switchRef}
        tabIndex={0}
        role="button"
        aria-pressed={checked}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onBlur={handleBlur}
      >
        <input
          id={id}
          className={styles.state}
          type="checkbox"
          tabIndex={-1}
          onChange={(e) =>
            disabled ? undefined : onCheckedChange(e.target.checked)
          }
          checked={checked}
        />
        <div className={cn(styles.switch, disabled && styles.disabled)}>
          <span className="sr-only">{label}</span>
        </div>
      </label>
    );
  }

  return (
    <div className={cn(styles[orientation], styles[theme])} style={style}>
      <TopLabels topLabels={topLabels} />

      <LeftLabel leftLabel={leftLabel} />

      <Switch />

      <BottomLabels bottomLabels={bottomLabels} />
    </div>
  );
}

export default RockerSwitch;
