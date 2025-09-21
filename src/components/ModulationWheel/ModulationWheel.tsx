import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { useModulationState } from "@/store/selectors";
import Wheel from "../Wheel";
import { Tooltip } from "../Tooltip";
import { TOOLTIP_DESCRIPTIONS } from "@/data/tooltipDescriptions";

export default function ModulationWheel() {
  const { modWheel } = useModulationState();
  const { setModWheel } = useSynthStore();
  const isSynthDisabled = useIsSynthDisabled();

  return (
    <Tooltip content={TOOLTIP_DESCRIPTIONS["modulation-wheel"]}>
      <Wheel
        value={modWheel ?? 50}
        min={0}
        max={100}
        onChange={setModWheel}
        label="Mod."
        isDisabled={isSynthDisabled}
      />
    </Tooltip>
  );
}
