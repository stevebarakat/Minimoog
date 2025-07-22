import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";

function Tuner() {
  const { isDisabled, tunerOn, setTunerOn } = useSynthStore();

  return (
    <RockerSwitch
      theme="blue"
      checked={tunerOn}
      onCheckedChange={setTunerOn}
      label="Tuner"
      topLabel="A-440"
      bottomLabelRight="On"
      disabled={isDisabled}
    />
  );
}

export default Tuner;
