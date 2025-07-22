import Wheel from "../Wheel";
import { useSynthStore } from "@/store/synthStore";

function ModulationWheel() {
  const { modWheel, setModWheel, isDisabled } = useSynthStore();
  return (
    <Wheel
      value={modWheel}
      min={0}
      max={100}
      onChange={setModWheel}
      label="Mod."
      isDisabled={isDisabled}
    />
  );
}

export default ModulationWheel;
