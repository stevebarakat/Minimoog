import { useSynthStore } from "@/store/synthStore";
import Knob from "../Knob";

function Glide() {
  const { glideTime, setGlideTime, isDisabled } = useSynthStore();

  return (
    <Knob
      value={glideTime}
      min={0}
      max={10}
      step={0.01}
      label="Glide"
      onChange={setGlideTime}
      valueLabels={{
        "0": "0",
        "2": "2",
        "4": "4",
        "6": "6",
        "8": "8",
        "10": "10",
      }}
      disabled={isDisabled}
    />
  );
}

export default Glide;
