import { useSynthStore } from "@/store/synthStore";
import {
  useMixerOsc1State,
  useMixerOsc2State,
  useMixerOsc3State,
  useMixerNoiseState,
  useMixerExternalState,
} from "@/store/selectors";
import Knob from "../Knob";
import Title from "../Title";
import Noise from "../Noise";
import ExternalInput from "../ExternalInput";
import Row from "../Row";
import Column from "../Column";
import Section from "../Section";
import { RockerSwitch } from "../RockerSwitch";
import Line from "../Line";

type MixerProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

const ROCKER_SWITCH_POSITION = { left: "1.65rem" } as const;
const KNOB_POSITION = { top: "-0.4rem" } as const;
const COLUMN_GAP = "1.25rem" as const;

export default function Mixer({ audioContext, mixerNode }: MixerProps) {
  const mixerOsc1 = useMixerOsc1State();
  const mixerOsc2 = useMixerOsc2State();
  const mixerOsc3 = useMixerOsc3State();
  const mixerNoise = useMixerNoiseState();
  const mixerExternal = useMixerExternalState();
  const { setMixerSource, isDisabled } = useSynthStore();

  return (
    <Section data-onboarding="mixer">
      <Row style={{ padding: "0 var(--spacing-md)" }}>
        <Column gap={COLUMN_GAP}>
          <Row>
            <Knob
              valueLabels={{
                0: "0",
                2: "2",
                4: "4",
                6: "6",
                8: "8",
                10: "10",
              }}
              logarithmic={true}
              value={mixerOsc1.volume}
              min={0}
              max={10}
              step={1}
              title="Volume"
              label="Oscillator 1 Volume"
              onChange={(v) => {
                setMixerSource("osc1", { volume: v });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={mixerOsc1.enabled}
              onCheckedChange={(checked) => {
                setMixerSource("osc1", { enabled: checked });
              }}
              label="Oscillator 1"
              bottomLabelRight="On"
              disabled={isDisabled}
            />
          </Row>
          <Row>
            <Knob
              valueLabels={{
                0: "0",
                2: "2",
                4: "4",
                6: "6",
                8: "8",
                10: "10",
              }}
              logarithmic={true}
              value={mixerOsc2.volume}
              min={0}
              max={10}
              step={1}
              title=" "
              label="Oscillator 2 Volume"
              onChange={(v) => {
                setMixerSource("osc2", { volume: v });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={mixerOsc2.enabled}
              onCheckedChange={(checked) => {
                setMixerSource("osc2", { enabled: checked });
              }}
              label="Oscillator 2"
              bottomLabelRight="On"
              disabled={isDisabled}
            />
          </Row>
          <Row>
            <Knob
              valueLabels={{
                0: "0",
                2: "2",
                4: "4",
                6: "6",
                8: "8",
                10: "10",
              }}
              logarithmic={true}
              value={mixerOsc3.volume}
              min={0}
              max={10}
              step={1}
              title=" "
              label="Oscillator 3 Volume"
              onChange={(v) => {
                setMixerSource("osc3", { volume: v });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={mixerOsc3.enabled}
              onCheckedChange={(checked) => {
                setMixerSource("osc3", { enabled: checked });
              }}
              label="Oscillator 3"
              bottomLabelRight="On"
              disabled={isDisabled}
            />
          </Row>
        </Column>
        <Column
          gap={COLUMN_GAP}
          align="flex-start"
          style={{ paddingRight: "5rem", left: "2.325rem" }}
        >
          <ExternalInput audioContext={audioContext} mixerNode={mixerNode} />
          <Noise audioContext={audioContext} mixerNode={mixerNode} />
        </Column>
      </Row>
      <Title>Mixer</Title>
    </Section>
  );
}
