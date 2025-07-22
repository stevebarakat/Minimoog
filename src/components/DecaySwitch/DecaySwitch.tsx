import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";

function DecaySwitch() {
  const { decaySwitchOn, setDecaySwitchOn, isDisabled } = useSynthStore();

  return (
    <RockerSwitch
      theme="white"
      label="Decay"
      topLabel="Decay"
      bottomLabelRight="On"
      checked={decaySwitchOn}
      onCheckedChange={setDecaySwitchOn}
      disabled={isDisabled}
    />
  );
}

export default DecaySwitch;
