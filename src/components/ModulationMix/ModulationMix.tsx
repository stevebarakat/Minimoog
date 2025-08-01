import Knob from "../Knob";
import { useSynthStore } from "@/store/synthStore";

function ModulationMix() {
  const { modMix, setModMix, isDisabled } = useSynthStore();

  return (
    <Knob
      value={modMix}
      logarithmic={true}
      min={0}
      max={10}
      step={1}
      label="Modulation Mix"
      onChange={setModMix}
      valueLabels={{
        "0": (
          <span style={{ fontSize: "var(--font-size-xxs)" }}>
            Osc. 3/
            <br />
            Filter Eg
          </span>
        ),
        "2": "2",
        "4": "4",
        "6": "6",
        "8": "8",
        "10": (
          <span style={{ fontSize: "var(--font-size-xxs)" }}>
            Noise/
            <br />
            LFO
          </span>
        ),
      }}
      disabled={isDisabled}
    />
  );
}

export default ModulationMix;
