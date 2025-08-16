import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { useMasterControlsState } from "@/store/selectors";
import Wheel from "../Wheel";

export default function PitchBender() {
  const { pitchWheel } = useMasterControlsState();
  const { setPitchWheel } = useSynthStore();
  const isSynthDisabled = useIsSynthDisabled();

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
      isDisabled={isSynthDisabled}
    />
  );
}
