import Knob from "../Knob";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";

export default function ModulationMix() {
  const { setModMix, modMix } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  const labelStyle: React.CSSProperties = {
    position: "relative",
    top: "0.25rem",
  };

  return (
    <Knob
      valueLabels={{
        0: (
          <span style={labelStyle}>
            Osc. 3/
            <br />
            Filter EG
          </span>
        ),
        2: "2",
        4: "4",
        6: "6",
        8: "8",
        10: (
          <span style={labelStyle}>
            Noise/
            <br />
            LFO
          </span>
        ),
      }}
      value={modMix}
      min={0}
      max={10}
      step={1}
      label="Modulation Mix"
      onChange={setModMix}
      disabled={isDisabled}
    />
  );
}
