import { useState, useEffect } from "react";
import { cn, cssModule } from "@/utils/helpers";
import styles from "./VintageLED.module.css";
import Title from "../Title";

export type LEDSize = "small" | "medium" | "large";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export type VintageLEDProps = {
  isOn?: boolean;
  warmupEffect?: boolean;
  className?: string;
  label?: string;
  size?: LEDSize;
  color?: "red" | "yellow";
  onCheckedChange: (e: React.FormEvent<HTMLInputElement>) => void;
};

function VintageLED({
  isOn = true,
  warmupEffect = true,
  className,
  label,
  size = "medium",
  color = "red",
  onCheckedChange,
}: VintageLEDProps) {
  const [isWarmedUp, setIsWarmedUp] = useState(isOn && !warmupEffect);

  useEffect(() => {
    let warmupTimer: ReturnType<typeof setTimeout>;

    if (isOn && warmupEffect) {
      setIsWarmedUp(false);
      warmupTimer = setTimeout(() => {
        setIsWarmedUp(true);
      }, 150);
    } else if (!isOn) {
      setIsWarmedUp(false);
    }

    return () => {
      clearTimeout(warmupTimer);
    };
  }, [isOn, warmupEffect]);

  const ledClasses = cssModule(
    styles,
    "vintageLed",
    `vintageLed${capitalizeFirstLetter(color)}`,
    `vintageLed${capitalizeFirstLetter(size)}`,
    isOn && "vintageLedOn",
    isWarmedUp && "vintageLedWarmedUp"
  );

  const containerClasses = cn(ledClasses, className);

  return (
    <div className={styles.container}>
      <div className={containerClasses}>
        <input
          type="checkbox"
          className={styles.vintageLedInput}
          checked={isOn}
          onChange={onCheckedChange}
        />
        <div className={styles.vintageLedInner}>
          <div className={styles.vintageLedGlow}></div>
          <div className={styles.vintageLedReflection}></div>
        </div>
      </div>

      <Title size="sm" style={{ marginTop: "var(--spacing-xs)" }}>
        {label}
      </Title>
    </div>
  );
}

export default VintageLED;
