import { useSynthStore } from "@/store/synthStore";
import Knob from "../Knob";

function Tune() {
  const { masterTune, setMasterTune, isDisabled } = useSynthStore();

  return (
    <Knob
      value={masterTune}
      min={-2}
      max={2}
      step={0.01}
      label="Tune"
      onChange={setMasterTune}
      valueLabels={{
        "-2": "-2",
        "-1": "-1",
        "0": "0",
        "1": "+1",
        "2": "+2",
      }}
      disabled={isDisabled}
    />
  );
}

export default Tune;
