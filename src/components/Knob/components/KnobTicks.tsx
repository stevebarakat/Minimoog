import React from "react";
import { calculateTickAngle } from "../utils";
import styles from "../Knob.module.css";
import { KnobType } from "../types";

type KnobTicksProps = {
  valueLabels: Record<number, string | React.ReactElement>;
  min: number;
  max: number;
  type: KnobType;
  showMidTicks: boolean;
};

export function KnobTicks({
  valueLabels,
  min,
  max,
  type,
  showMidTicks,
}: KnobTicksProps) {
  const labelKeys = Object.keys(valueLabels)
    .map(Number)
    .sort((a, b) => a - b);

  // Main ticks for valueLabels
  const mainTicks = labelKeys.map((tick) => {
    const angle = calculateTickAngle(tick, min, max, type);
    return (
      <div
        key={`tick-${tick}`}
        className={styles.knobTick}
        style={{
          transform: `rotate(${angle}deg) translateY( calc(-1 * var(--tick-offset)))`,
        }}
      />
    );
  });

  // Mid ticks (between main ticks)
  let midTicks: React.ReactNode[] = [];
  if (showMidTicks && type !== "arrow") {
    // Create all possible midTicks
    const allMidTicks = labelKeys.slice(0, -1).map((tick, i) => {
      const nextTick = labelKeys[i + 1];
      const mid = (tick + nextTick) / 2;
      const midAngle = calculateTickAngle(mid, min, max, type);
      return {
        key: `tick-mid-${tick}-${nextTick}`,
        angle: midAngle,
        index: i,
      };
    });
    // For attackDecay, skip the first two midTicks
    midTicks = (
      type === "attackDecay" ? allMidTicks.filter((_, i) => i > 1) : allMidTicks
    ).map(({ key, angle }) => (
      <div
        key={key}
        className={styles.knobTick}
        style={{
          transform: `rotate(${angle}deg) translate(-50%, calc(-1 * var(--tick-offset)))`,
        }}
      />
    ));
  }

  return (
    <>
      {mainTicks}
      {midTicks}
    </>
  );
}
