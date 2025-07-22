import React from "react";
import { calculateLabelPosition } from "../utils";
import styles from "../Knob.module.css";
import { KnobType } from "../types";

type KnobLabelsProps = {
  valueLabels: Record<number, string | React.ReactElement>;
  min: number;
  max: number;
  type: KnobType;
  size: "small" | "medium" | "large";
};

export function KnobLabels({
  valueLabels,
  min,
  max,
  type,
  size,
}: KnobLabelsProps) {
  return (
    <>
      {Object.keys(valueLabels).map((tickKey) => {
        const tick = Number(tickKey);
        const { x, y } = calculateLabelPosition(tick, min, max, size, type);

        return (
          <div
            key={tick}
            className={styles.valueLabel}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            {valueLabels[tick]}
          </div>
        );
      })}
    </>
  );
}
