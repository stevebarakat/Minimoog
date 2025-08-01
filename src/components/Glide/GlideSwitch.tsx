import { useSynthStore } from "@/store/synthStore";
import { RockerSwitch } from "../RockerSwitch";

function GlideSwitch() {
  const { glideOn, setGlideOn, isDisabled } = useSynthStore();
  return (
    <RockerSwitch
      theme="white"
      label="Glide (On/Off)"
      topLabel="Glide"
      bottomLabelRight="On"
      checked={glideOn}
      onCheckedChange={setGlideOn}
      disabled={isDisabled}
    />
  );
}

export default GlideSwitch;
