import { useSynthStore } from "@/store/synthStore";
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

function Mixer({ audioContext, mixerNode }: MixerProps) {
  const { mixer, setMixerSource, isDisabled } = useSynthStore();

  return (
    <Section>
      <Row style={{ padding: "0 var(--spacing-md)" }}>
        <Column gap="1.35rem">
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
              value={mixer.osc1.volume}
              min={0}
              max={10}
              step={1}
              title="Volume"
              label="Oscillator 1 Volume"
              onChange={(v) => {
                setMixerSource("osc1", { volume: v });
              }}
              size="medium"
              style={{
                top: "-0.25rem",
              }}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={{ left: "1.65rem" }}
              theme="blue"
              checked={mixer.osc1.enabled}
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
              value={mixer.osc2.volume}
              min={0}
              max={10}
              step={1}
              title=" "
              label="Oscillator 2 Volume"
              onChange={(v) => {
                setMixerSource("osc2", { volume: v });
              }}
              size="medium"
              style={{
                top: "-0.25rem",
              }}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={{ left: "1.65rem" }}
              theme="blue"
              checked={mixer.osc2.enabled}
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
              value={mixer.osc3.volume}
              min={0}
              max={10}
              step={1}
              title=" "
              label="Oscillator 3 Volume"
              onChange={(v) => {
                setMixerSource("osc3", { volume: v });
              }}
              size="medium"
              style={{
                top: "-0.25rem",
              }}
              disabled={isDisabled}
            />
            <Line />
            <RockerSwitch
              style={{ left: "1.65rem" }}
              theme="blue"
              checked={mixer.osc3.enabled}
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
          style={{ paddingRight: "5rem", left: "2.325rem", gap: "1.45rem" }}
        >
          <ExternalInput audioContext={audioContext} mixerNode={mixerNode} />
          <Noise audioContext={audioContext} mixerNode={mixerNode} />
        </Column>
      </Row>
      <Title>Mixer</Title>
    </Section>
  );
}

export default Mixer;
