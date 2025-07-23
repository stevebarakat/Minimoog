import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { UI } from "@/config";

function Tuner() {
  const { isDisabled, tunerOn, setTunerOn } = useSynthStore();

  return (
    <RockerSwitch
      theme="blue"
      checked={tunerOn}
      onCheckedChange={setTunerOn}
      label="Tuner"
      topLabel={UI.TUNER.A440_LABEL}
      bottomLabelRight="On"
      disabled={isDisabled}
    />
  );
}

export default Tuner;
