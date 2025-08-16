import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";
import Column from "../Column";
import Title from "../Title";

function MainOutput() {
  const { mainVolume, setMainVolume, isMainActive, setIsMainActive } =
    useSynthStore();
  const isDisabled = useIsSynthDisabled();

  return (
    <Row gap="var(--spacing-md)" style={{ padding: "0.5rem 0" }}>
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
        id="main-volume"
        disabled={isDisabled}
      />
      <Column
        justify="space-between"
        style={{ height: "100%", marginTop: "-0.8rem" }}
      >
        <Title size="sm">Main Output</Title>
        <RockerSwitch
          theme="blue"
          checked={isMainActive}
          onCheckedChange={(checked) => {
            setIsMainActive(checked);
          }}
          label="Main Output"
          bottomLabelRight="On"
          disabled={isDisabled}
          style={{
            top: "-0.25rem",
            paddingLeft: "0.5rem",
          }}
        />
      </Column>
    </Row>
  );
}

export default MainOutput;
