import Knob from "../Knob";
import Row from "../Row";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import { attackDecayValueLabels } from "./constants";
import {
  valueToKnobPos,
  knobPosToValue,
} from "../Knob/utils/attackDecayMapping";

function FilterEnvelope() {
  const {
    filterAttack,
    filterDecay,
    filterSustain,
    isDisabled,
    setFilterEnvelope,
  } = useSynthStore();

  return (
    <Column
      style={{ paddingRight: "0.75rem", paddingTop: "var(--spacing-xs)" }}
    >
      <Column>
        <Row gap="var(--spacing-xl)">
          <Knob
            type="attackDecay"
            valueLabels={attackDecayValueLabels}
            value={valueToKnobPos(filterAttack)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Attack Time"
            onChange={(position) =>
              setFilterEnvelope({
                attack: Number(knobPosToValue(position).toFixed(0)),
              })
            }
            disabled={isDisabled}
          />
          <Knob
            type="attackDecay"
            valueLabels={attackDecayValueLabels}
            value={valueToKnobPos(filterDecay)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Decay Time"
            onChange={(position) =>
              setFilterEnvelope({
                decay: Number(knobPosToValue(position).toFixed(0)),
              })
            }
            disabled={isDisabled}
          />
          <Knob
            valueLabels={{
              0: "0",
              2: "2",
              4: "4",
              6: "6",
              8: "8",
              10: "10",
            }}
            value={filterSustain}
            min={0}
            max={10}
            step={1}
            label="Sustain Level"
            onChange={(value) => setFilterEnvelope({ sustain: value })}
            disabled={isDisabled}
          />
        </Row>
      </Column>
    </Column>
  );
}

export default FilterEnvelope;
