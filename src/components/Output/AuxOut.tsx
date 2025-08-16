import { useSynthStore } from "@/store/synthStore";
import { useOutputState, useIsSynthDisabled } from "@/store/selectors";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";
import Column from "../Column";
import Title from "../Title";

export default function AuxOut() {
  const { auxOutput } = useOutputState();
  const { setAuxOutput } = useSynthStore();
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
        value={auxOutput.volume}
        logarithmic={true}
        min={0}
        max={10}
        step={0.1}
        onChange={(value) => setAuxOutput({ volume: value })}
        label="Volume"
        id="aux-volume"
        disabled={isDisabled}
      />
      <Column
        gap="1.1rem"
        style={{ height: "100%", marginTop: "-0.8rem", paddingLeft: "0.75rem" }}
      >
        <Title size="sm">Aux Out</Title>
        <RockerSwitch
          theme="blue"
          checked={auxOutput.enabled}
          onCheckedChange={(checked) => setAuxOutput({ enabled: checked })}
          label="Aux Out"
          bottomLabelRight="On"
          disabled={isDisabled}
        />
      </Column>
    </Row>
  );
}
