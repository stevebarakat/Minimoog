import Wheel from "../Wheel";
import { useSynthStore } from "@/store/synthStore";
import { useModulationState } from "@/store/selectors";

export default function ModulationWheel() {
  const { modWheel } = useModulationState();
  const { setModWheel, isDisabled } = useSynthStore();
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
