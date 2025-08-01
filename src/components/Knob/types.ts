import React from "react";

type KnobProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  title?: string | React.ReactElement | null;
  unit?: string;
  onChange: (value: number) => void;
  valueLabels?: Record<number, string | React.ReactElement>;
  size?: KnobSize;
  showMidTicks?: boolean;
  type?: KnobType;
  logarithmic?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
};

type KnobSize = "small" | "medium" | "large";
type KnobType = "arrow" | "radial" | "attackDecay";

export type { KnobProps, KnobSize, KnobType };
