import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { useOutputState } from "@/store/selectors";

export default function Tuner() {
  const { tunerOn } = useOutputState();
  const { isDisabled, setTunerOn } = useSynthStore();

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
