import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { useModulationState } from "@/store/selectors";
import Wheel from "../Wheel";

export default function ModulationWheel() {
  const { modWheel } = useModulationState();
  const { setModWheel } = useSynthStore();
  const isSynthDisabled = useIsSynthDisabled();

  return (
    <Wheel
      value={modWheel ?? 50}
      min={0}
      max={100}
      onChange={setModWheel}
      label="Mod."
      isDisabled={isSynthDisabled}
    />
  );
}
