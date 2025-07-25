import { useSynthStore } from "@/store/synthStore";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";

function AuxOut() {
  const { auxOutput, setAuxOutput, isDisabled } = useSynthStore();

  return (
    <Row gap="var(--spacing-md)" style={{ padding: "var(--spacing-md) 0" }}>
      <Knob
        valueLabels={{
          0: "0",
          2: "2",
          4: "4",
          6: "6",
          8: "8",
          10: "10",
        }}
        value={auxOutput.volume}
        logarithmic={true}
        min={0}
        max={10}
        step={0.1}
        onChange={(value) => setAuxOutput({ volume: value })}
        label="Volume"
        disabled={isDisabled}
      />
      <RockerSwitch
        theme="blue"
        checked={auxOutput.enabled}
        onCheckedChange={(checked) => setAuxOutput({ enabled: checked })}
        label="Aux Out"
        topLabel="Aux Out"
        bottomLabelRight="On"
        disabled={isDisabled}
      />
    </Row>
  );
}

export default AuxOut;
