import Knob from "../Knob";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled, useModulationState } from "@/store/selectors";
import { useCallback, useEffect, useState } from "react";
import { Tooltip } from "@/components/Tooltip";

export default function LfoRate() {
  const { lfoRate, lfoWaveform } = useModulationState();
  const { setLfoRate, setLfoWaveform } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  // Add push/pull state for knob
  const [wavePulled, setWavePulled] = useState(lfoWaveform === "square");

  // Sync pushPull state to waveform changes from external sources
  // This keeps visual state consistent if waveform changes externally (e.g., preset loading)
  useEffect(() => {
    setWavePulled(lfoWaveform === "square");
  }, [lfoWaveform]);

  const handleLfoRateChange = useCallback(
    (value: number) => {
      setLfoRate(value);
    },
    [setLfoRate]
  );

  // Handle push/pull toggle from the knob itself:
  const handlePushPullChange = useCallback(
    (pulled: boolean) => {
      setWavePulled(pulled);
      // Update waveform accordingly
      setLfoWaveform(pulled ? "square" : "triangle");
    },
    [setLfoWaveform]
  );

  return (
    <Tooltip content="Click to change waveform">
      <div>
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
          id="main-lfo-rate"
          onChange={handleLfoRateChange}
          disabled={isDisabled}
          pushPull
          pushPullValue={wavePulled}
          onPushPullChange={handlePushPullChange}
        />
      </div>
    </Tooltip>
  );
}
