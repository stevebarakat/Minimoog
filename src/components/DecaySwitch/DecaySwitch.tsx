import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import {
  useIsSynthDisabled,
  useLoudnessEnvelopeState,
} from "@/store/selectors";

export default function DecaySwitch() {
  const { decaySwitchOn } = useLoudnessEnvelopeState();
  const { setDecaySwitchOn } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  const handleDecaySwitchChange = (checked: boolean) => {
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
