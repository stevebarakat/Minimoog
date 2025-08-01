import Wheel from "../Wheel";
import { useSynthStore } from "@/store/synthStore";

function PitchBender() {
  const { pitchWheel, setPitchWheel, isDisabled } = useSynthStore();

  const handleChange = (value: number) => {
    setPitchWheel(value);
  };

  const handleMouseUp = () => {
    setPitchWheel(50); // Center position
  };

  return (
    <Wheel
      value={pitchWheel}
      min={0}
      max={100}
      step={0.01}
      onChange={handleChange}
      onMouseUp={handleMouseUp}
      label="Pitch"
      isDisabled={isDisabled}
    />
  );
}

export default PitchBender;
