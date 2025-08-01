import Knob from "../Knob";
import Row from "../Row";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import { useFilterEnvelopeState } from "@/store/selectors";
import { attackDecayValueLabels } from "./constants";
import { valueToKnobPos, knobPosToValue } from "@/utils";

export default function FilterEnvelope() {
  const filterEnvelope = useFilterEnvelopeState();
  const { setFilterEnvelope, isDisabled } = useSynthStore();

  return (
    <Column
      style={{
        paddingRight: "var(--spacing-lg)",
        paddingTop: "0.125rem",
      }}
    >
      <Column>
        <Row gap="var(--spacing-xl)">
          <Knob
            type="attackDecay"
            valueLabels={attackDecayValueLabels}
            value={valueToKnobPos(filterEnvelope.filterAttack)}
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
            value={valueToKnobPos(filterEnvelope.filterDecay)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Decay Time"
            onChange={(position) => {
              const decayValue = Number(knobPosToValue(position).toFixed(0));

              setFilterEnvelope({
                decay: decayValue,
              });
            }}
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
            value={filterEnvelope.filterSustain}
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
