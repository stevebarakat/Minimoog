import { useSynthStore } from "@/store/synthStore";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";

function MainOutput() {
  const {
    mainVolume,
    setMainVolume,
    isMainActive,
    setIsMainActive,
    isDisabled,
  } = useSynthStore();

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
        value={mainVolume}
        logarithmic={true}
        min={0}
        max={10}
        step={0.1}
        onChange={setMainVolume}
        label="Volume"
        disabled={isDisabled}
      />
      <RockerSwitch
        theme="blue"
        checked={isMainActive}
        onCheckedChange={(checked) => {
          setIsMainActive(checked);
        }}
        label="Main Output"
        topLabel="Main&nbsp;Output"
        bottomLabelRight="On"
        disabled={isDisabled}
      />
    </Row>
  );
}

export default MainOutput;
