import { RockerSwitch } from "@/components/RockerSwitch";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useSynthStore } from "@/store/synthStore";
import { cn } from "@/utils";
import styles from "./OscillatorModulation.module.css";

function OscillatorModulation() {
  const { oscillatorModulationOn, setOscillatorModulationOn, isDisabled } =
    useSynthStore();
  const isMobile = useIsMobile();
  return (
    <div className={cn(styles.container, isMobile && styles.mobile)}>
      <RockerSwitch
        theme="orange"
        checked={oscillatorModulationOn}
        onCheckedChange={setOscillatorModulationOn}
        label="Oscillator Modulation"
        topLabel="Oscillator Modulation"
        bottomLabelRight="On"
        disabled={isDisabled}
      />
    </div>
  );
}

export default OscillatorModulation;
