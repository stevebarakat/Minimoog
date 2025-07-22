import Knob from "../Knob";
import { useSynthStore } from "@/store/synthStore";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useCallback } from "react";

const tooltipStyles = {
  backgroundColor: "var(--color-background)",
  color: "var(--color-text)",
  padding: "var(--spacing-sm)",
  borderRadius: "var(--spacing-sm)",
  fontSize: "var(--font-size-lg)",
  zIndex: 9999999,
};

function LFORate() {
  const { lfoWaveform, setLfoWaveform, lfoRate, setLfoRate } = useSynthStore();
  const isDisabled = useSynthStore((s) => s.isDisabled);
  const handleDoubleClick = useCallback(() => {
    setLfoWaveform(lfoWaveform === "triangle" ? "square" : "triangle");
  }, [lfoWaveform, setLfoWaveform]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div onDoubleClick={handleDoubleClick}>
            <Knob
              size="small"
              valueLabels={{
                0: "0",
                2: "2",
                4: "4",
                6: "6",
                8: "8",
                10: "10",
              }}
              value={lfoRate}
              min={0}
              max={10}
              step={1}
              label="LFO Rate"
              onChange={setLfoRate}
              disabled={isDisabled}
            />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          align="center"
          sideOffset={8}
          style={tooltipStyles}
        >
          double click to change waveform. <br />
          current waveform: {lfoWaveform}
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}

export default LFORate;
