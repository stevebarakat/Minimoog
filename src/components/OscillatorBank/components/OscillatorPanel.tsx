import React from "react";
import { RockerSwitch } from "@/components/RockerSwitch";
import Row from "@/components/Row";

export type OscillatorPanelProps = {
  showControlSwitch?: boolean;
  controlSwitchProps?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    theme?: "black" | "orange" | "blue" | "white";
  };
  children: React.ReactNode;
  style?: React.CSSProperties;
  isDisabled?: boolean;
};

function OscillatorPanel({
  showControlSwitch = false,
  controlSwitchProps,
  children,
  style,
  isDisabled,
}: OscillatorPanelProps) {
  return (
    <Row style={style}>
      {showControlSwitch && controlSwitchProps && (
        <RockerSwitch
          style={{ marginLeft: "-0.25rem", marginRight: "-0.5rem" }}
          orientation="vertical"
          {...controlSwitchProps}
          label={controlSwitchProps.label}
          topLabel={
            <span style={{ fontSize: "var(--font-size-xxs)" }}>
              Osc. 3 Control
            </span>
          }
          disabled={isDisabled}
        />
      )}
      {children}
    </Row>
  );
}

export default OscillatorPanel;
