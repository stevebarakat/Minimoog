import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";

function DecaySwitch() {
  const { decaySwitchOn, setDecaySwitchOn, isDisabled } = useSynthStore();

  const handleDecaySwitchChange = (checked: boolean) => {
    console.log("DecaySwitch: toggling from", decaySwitchOn, "to", checked);
    setDecaySwitchOn(checked);
  };

  return (
    <RockerSwitch
      theme="white"
      label="Decay"
      topLabel="Decay"
      bottomLabelRight="On"
      checked={decaySwitchOn}
      onCheckedChange={handleDecaySwitchChange}
      disabled={isDisabled}
    />
  );
}

export default DecaySwitch;
