import { useSynthStore } from "@/store/synthStore";
import { useMasterControlsState, useIsSynthDisabled } from "@/store/selectors";
import Knob from "../Knob";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

export default function Tune() {
  const { masterTune } = useMasterControlsState();
  const { setMasterTune } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  return (
    <Tooltip content={getTooltipContent("master-tune")}>
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
    </Tooltip>
  );
}
