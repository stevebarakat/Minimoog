import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";

const style: React.CSSProperties = {
  position: "absolute",
  top: "25%",
  left: "-1.5rem",
};

function OscillatorModulation() {
  const { oscillatorModulationOn, setOscillatorModulationOn, isDisabled } =
    useSynthStore();
  return (
    <div style={style}>
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
