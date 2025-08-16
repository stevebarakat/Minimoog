import Knob from "../Knob";
import Row from "../Row";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import { useFilterEnvelopeState, useIsSynthDisabled } from "@/store/selectors";
import { attackDecayValueLabels } from "./constants";
import { valueToKnobPos, knobPosToValue } from "@/utils";

export default function FilterEnvelope() {
  const filterEnvelope = useFilterEnvelopeState();
  const { setFilterEnvelope } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  return (
    <Column
      style={{
        paddingRight: "var(--spacing-sm)",
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
            id="filter-attack-time"
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
            id="filter-decay-time"
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
              2000: "2",
              4000: "4",
              6000: "6",
              8000: "8",
              10000: "10",
            }}
            value={valueToKnobPos(filterEnvelope.filterSustain)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Sustain Level"
            id="filter-sustain-level"
            onChange={(position) => {
              const sustainValue = Number(knobPosToValue(position).toFixed(0));

              setFilterEnvelope({
                sustain: sustainValue,
              });
            }}
            disabled={isDisabled}
          />
        </Row>
      </Column>
    </Column>
  );
}
