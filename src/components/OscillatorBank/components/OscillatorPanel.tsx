import React from "react";
import { RockerSwitch } from "@/components/RockerSwitch";
import Row from "@/components/Row";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipContent } from "@/utils/tooltipUtils";

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
    <Row style={style} gap="var(--spacing-xs)">
      {showControlSwitch && controlSwitchProps && (
        <Tooltip
          content={getTooltipContent("oscillator-3-control")}
          side="right"
        >
          <RockerSwitch
            orientation="vertical"
            theme={controlSwitchProps.theme || "orange"}
            checked={controlSwitchProps.checked}
            onCheckedChange={controlSwitchProps.onCheckedChange}
            label={controlSwitchProps.label}
            topLabel={controlSwitchProps.label}
            disabled={isDisabled}
          />
        </Tooltip>
      )}
      {children}
    </Row>
  );
}

export default OscillatorPanel;
