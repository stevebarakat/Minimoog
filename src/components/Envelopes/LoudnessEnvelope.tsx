import Knob from "../Knob";
import Row from "../Row";
import Title from "../Title";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import {
  useLoudnessEnvelopeState,
  useIsSynthDisabled,
} from "@/store/selectors";
import { attackDecayValueLabels } from "./constants";
import { valueToKnobPos, knobPosToValue } from "@/utils";

export default function LoudnessEnvelope() {
  const loudnessEnvelope = useLoudnessEnvelopeState();
  const { setLoudnessEnvelope } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

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
            value={valueToKnobPos(loudnessEnvelope.loudnessAttack)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Attack Time"
            id="loudness-attack-time"
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
            value={valueToKnobPos(loudnessEnvelope.loudnessDecay)}
            showMidTicks={true}
            min={0}
            max={10000}
            step={100}
            label="Decay Time"
            id="loudness-decay-time"
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
            value={loudnessEnvelope.loudnessSustain}
            min={0}
            max={10}
            step={1}
            label="Sustain Level"
            id="loudness-sustain-level"
            onChange={(value) => setLoudnessEnvelope({ sustain: value })}
            disabled={isDisabled}
          />
        </Row>
      </Column>
    </Column>
  );
}
