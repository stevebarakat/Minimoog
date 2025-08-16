import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import {
  useOscillator1State,
  useOscillator2State,
  useOscillator3State,
} from "@/store/selectors";
import Row from "../Row";
import Knob from "../Knob";
import Title from "../Title";
import Noise from "../Noise";
import ExternalInput from "../ExternalInput";
import Column from "../Column";
import Section from "../Section";
import { RockerSwitch } from "../RockerSwitch";
import Line from "../Line";
import { SYNTH_CONFIG } from "@/config";
import { createVolumeRange } from "@/store/types/synth";

type MixerProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

const ROCKER_SWITCH_POSITION = { left: "1.65rem" } as const;
const KNOB_POSITION = { top: "-0.4rem" } as const;
const COLUMN_GAP = "1.25rem" as const;

export default function Mixer({ audioContext, mixerNode }: MixerProps) {
  const { setOscillator1, setOscillator2, setOscillator3 } = useSynthStore();
  const isSynthDisabled = useIsSynthDisabled();
  const oscillator1 = useOscillator1State();
  const oscillator2 = useOscillator2State();
  const oscillator3 = useOscillator3State();

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
              value={oscillator1.volume}
              min={SYNTH_CONFIG.OSCILLATORS.OSC1.VOLUME.MIN}
              max={SYNTH_CONFIG.OSCILLATORS.OSC1.VOLUME.MAX}
              step={1}
              title="Volume"
              label="Oscillator 1 Volume"
              onChange={(v) => {
                setOscillator1({ volume: createVolumeRange(v) });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isSynthDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={oscillator1.enabled}
              onCheckedChange={(checked) => {
                setOscillator1({ enabled: checked });
              }}
              label="Oscillator 1"
              bottomLabelRight="On"
              disabled={isSynthDisabled}
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
              value={oscillator2.volume}
              min={SYNTH_CONFIG.OSCILLATORS.OSC2.VOLUME.MIN}
              max={SYNTH_CONFIG.OSCILLATORS.OSC2.VOLUME.MAX}
              step={1}
              title=" "
              label="Oscillator 2 Volume"
              onChange={(v) => {
                setOscillator2({ volume: createVolumeRange(v) });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isSynthDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={oscillator2.enabled}
              onCheckedChange={(checked) => {
                setOscillator2({ enabled: checked });
              }}
              label="Oscillator 2"
              bottomLabelRight="On"
              disabled={isSynthDisabled}
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
              value={oscillator3.volume}
              min={SYNTH_CONFIG.OSCILLATORS.OSC3.VOLUME.MIN}
              max={SYNTH_CONFIG.OSCILLATORS.OSC3.VOLUME.MAX}
              step={1}
              title=" "
              label="Oscillator 3 Volume"
              onChange={(v) => {
                setOscillator3({ volume: createVolumeRange(v) });
              }}
              size="medium"
              style={KNOB_POSITION}
              disabled={isSynthDisabled}
            />
            <Line />
            <RockerSwitch
              style={ROCKER_SWITCH_POSITION}
              theme="blue"
              checked={oscillator3.enabled}
              onCheckedChange={(checked) => {
                setOscillator3({ enabled: checked });
              }}
              label="Oscillator 3"
              bottomLabelRight="On"
              disabled={isSynthDisabled}
            />
          </Row>
        </Column>
        <Column
          gap={COLUMN_GAP}
          align="flex-start"
          style={{ paddingRight: "3.5rem", left: "2.325rem" }}
        >
          <ExternalInput audioContext={audioContext} mixerNode={mixerNode} />
          <Noise audioContext={audioContext} mixerNode={mixerNode} />
        </Column>
      </Row>
      <Title>Mixer</Title>
    </Section>
  );
}
