import { useSynthStore } from "@/store/synthStore";
import { useGlideState, useIsSynthDisabled } from "@/store/selectors";
import { RockerSwitch } from "../RockerSwitch";

export default function GlideSwitch() {
  const { glideOn } = useGlideState();
  const { setGlideOn } = useSynthStore();
  const isDisabled = useIsSynthDisabled();
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
