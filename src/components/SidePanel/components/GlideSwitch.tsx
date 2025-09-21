import { useSynthStore } from "@/store/synthStore";
import { RockerSwitch } from "@/components/RockerSwitch";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipContent } from "@/utils/ui";

function GlideSwitch() {
  const { glideOn, setGlideOn, isDisabled } = useSynthStore();
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

export default GlideSwitch;
