import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipContent } from "@/utils/ui";

function DecaySwitch() {
  const { decaySwitchOn, setDecaySwitchOn, isDisabled } = useSynthStore();

  return (
    <Tooltip content={getTooltipContent("decay-switch")}>
      <RockerSwitch
        theme="white"
        label="Decay"
        topLabel="Decay"
        bottomLabelRight="On"
        checked={decaySwitchOn}
        onCheckedChange={setDecaySwitchOn}
        disabled={isDisabled}
      />
    </Tooltip>
  );
}

export default DecaySwitch;
