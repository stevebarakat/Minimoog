import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled, useTunerOn } from "@/store/selectors";
import { RockerSwitch } from "../RockerSwitch";
import { TOOLTIP_DESCRIPTIONS } from "@/data/tooltipDescriptions";
import { Tooltip } from "../Tooltip";

export default function Tuner() {
  const { setTunerOn } = useSynthStore();
  const tunerOn = useTunerOn();
  const isDisabled = useIsSynthDisabled();

  return (
    <Tooltip content={TOOLTIP_DESCRIPTIONS["tuner"]}>
      <RockerSwitch
        style={{
          marginLeft: "0.5rem",
        }}
        theme="blue"
        checked={tunerOn}
        onCheckedChange={setTunerOn}
        label="Tuner"
        topLabel="A-440"
        bottomLabelRight="On"
        disabled={isDisabled}
      />
    </Tooltip>
  );
}
