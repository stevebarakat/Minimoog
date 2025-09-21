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

    // Filter midticks based on knob type and range
    let filteredMidTicks = allMidTicks;

    if (type === "attackDecay") {
      // For attackDecay, skip the first two midTicks
      filteredMidTicks = allMidTicks.filter((_, i) => i > 1);
    } else if (min === -5 && max === 5 && labelKeys.length >= 7) {
      // For -5 to 5 range knobs (like filter cutoff), skip first and last midticks
      filteredMidTicks = allMidTicks.filter(
        (_, i) => i > 0 && i < allMidTicks.length - 1
      );
    }

    midTicks = filteredMidTicks.map(({ key, angle }) => (
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
