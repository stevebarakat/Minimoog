import Knob from "../Knob";
import Row from "../Row";
import Title from "../Title";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import { attackDecayValueLabels } from "./constants";
import { valueToKnobPos, knobPosToValue } from "@/utils";

function LoudnessEnvelope() {
  const {
    loudnessAttack,
    loudnessDecay,
    loudnessSustain,
    isDisabled,
    setLoudnessEnvelope,
  } = useSynthStore();

  return (
    <Column
      style={{
        paddingRight: "var(--spacing-sm)",
        paddingTop: "0.125rem",
      }}
    >
      <Title size="lg">Loudness Contour</Title>
      <Column>
        <Row gap="var(--spacing-xl)">
          <Knob
            type="attackDecay"
            valueLabels={attackDecayValueLabels}
            value={valueToKnobPos(loudnessAttack)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Attack Time"
            onChange={(position) =>
              setLoudnessEnvelope({
                attack: Number(knobPosToValue(position).toFixed(0)),
              })
            }
            disabled={isDisabled}
          />
          <Knob
            type="attackDecay"
            valueLabels={attackDecayValueLabels}
            value={valueToKnobPos(loudnessDecay)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Decay Time"
            onChange={(position) => {
              const decayValue = Number(knobPosToValue(position).toFixed(0));

              setLoudnessEnvelope({
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
            value={loudnessSustain}
            min={0}
            max={10}
            step={1}
            label="Sustain Level"
            onChange={(value) => setLoudnessEnvelope({ sustain: value })}
            disabled={isDisabled}
          />
        </Row>
      </Column>
    </Column>
  );
}

export default LoudnessEnvelope;
