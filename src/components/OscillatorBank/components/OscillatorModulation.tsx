import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { cn } from "@/utils";
import styles from "./OscillatorModulation.module.css";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipDescription } from "@/data/tooltipDescriptions";

function OscillatorModulation() {
  const { oscillatorModulationOn, setOscillatorModulationOn } = useSynthStore();

  return (
    <div className={cn(styles.container)}>
      <Tooltip
        content={getTooltipDescription("oscillator-modulation") || ""}
        side="right"
      >
        <RockerSwitch
          theme="orange"
          checked={oscillatorModulationOn}
          onCheckedChange={setOscillatorModulationOn}
          label="Oscillator Modulation"
          topLabel="Oscillator Modulation"
          bottomLabelRight="On"
        />
      </Tooltip>
    </div>
  );
}

export default OscillatorModulation;
