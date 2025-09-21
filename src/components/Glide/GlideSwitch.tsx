import { useSynthStore } from "@/store/synthStore";
import { useGlideState, useIsSynthDisabled } from "@/store/selectors";
import { RockerSwitch } from "../RockerSwitch";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils/ui";

export default function GlideSwitch() {
  const { glideOn } = useGlideState();
  const { setGlideOn } = useSynthStore();
  const isDisabled = useIsSynthDisabled();
  return (
    <Tooltip content={getTooltipContent("glide-switch")}>
      <RockerSwitch
        theme="white"
        label="Glide (On/Off)"
        topLabel="Glide"
        bottomLabelRight="On"
        checked={glideOn}
        onCheckedChange={setGlideOn}
        disabled={isDisabled}
      />
    </Tooltip>
  );
}
