import { useSynthStore } from "@/store/synthStore";
import { useMasterControlsState, useIsSynthDisabled } from "@/store/selectors";
import Knob from "../Knob";

export default function Tune() {
  const { masterTune } = useMasterControlsState();
  const { setMasterTune } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

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
