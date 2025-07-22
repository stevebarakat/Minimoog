import { useSynthStore } from "@/store/synthStore";
import { RockerSwitch } from "@/components/RockerSwitch";
import { Square, Triangle } from "lucide-react";

function LfoShapeSwitch() {
  const { lfoWaveform, setLfoWaveform, isDisabled } = useSynthStore();

  return (
    <RockerSwitch
      theme="white"
      label="LFO Shape"
      // topLabel="Shape"
      topLabelRight={
        <Square size={8} strokeWidth={5} color="var(--color-text-primary)" />
      }
      topLabelLeft={
        <Triangle size={8} strokeWidth={5} color="var(--color-text-primary)" />
      }
      checked={lfoWaveform === "triangle"}
      onCheckedChange={(checked) =>
        setLfoWaveform(checked ? "triangle" : "square")
      }
      disabled={isDisabled}
    />
  );
}

export default LfoShapeSwitch;
