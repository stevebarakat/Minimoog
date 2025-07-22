import Knob from "@/components/Knob";
import { useSynthStore } from "@/store/synthStore";

function LFORate() {
  const { lfoRate, setLfoRate, isDisabled } = useSynthStore();

  return (
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
  );
}

export default LFORate;
