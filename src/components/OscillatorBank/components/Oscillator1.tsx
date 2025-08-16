import { useSynthStore } from "@/store/synthStore";
import { useOscillator1State } from "@/store/selectors";
import OscillatorPanel from "./OscillatorPanel";
import Knob from "@/components/Knob";
import {
  TriangleIcon,
  TriSawIcon,
  SawtoothIcon,
  SquareIcon,
  WidePulseIcon,
  NarrowPulseIcon,
} from "../icons/WaveformIcons";
import { OscillatorWaveform, OscillatorRange } from "@/types/oscillator";
import { MIDI } from "@/config/constants";
import Spacer from "@/components/Spacer";
import Title from "@/components/Title";

const waveforms: OscillatorWaveform[] = [
  "triangle",
  "tri_saw",
  "sawtooth",
  "pulse1",
  "pulse2",
  "pulse3",
];
const waveformIcons = [
  <TriangleIcon key="triangle" />,
  <TriSawIcon key="tri_saw" />,
  <SawtoothIcon key="sawtooth" />,
  <SquareIcon key="pulse1" />,
  <WidePulseIcon key="pulse2" />,
  <NarrowPulseIcon key="pulse3" />,
];
const ranges: OscillatorRange[] = [...MIDI.OSCILLATOR_RANGE_VALUES];

export default function Oscillator1() {
  const oscillator1 = useOscillator1State();
  const { setOscillator1 } = useSynthStore();
  const isDisabled = useSynthStore((state) => !state.audioContext.isReady);

  function handleWaveformChange(value: number) {
    setOscillator1({ waveform: waveforms[Math.round(value)] });
  }
  function handleRangeChange(value: number) {
    setOscillator1({ range: ranges[Math.round(value)] });
  }

  return (
    <OscillatorPanel>
      <Spacer width="2.1rem" />
      <Knob
        type="arrow"
        size="large"
        value={ranges.indexOf(oscillator1.range)}
        min={0}
        max={ranges.length - 1}
        step={1}
        label="Range"
        id="osc1-range"
        onChange={handleRangeChange}
        valueLabels={ranges.reduce((acc, r, i) => ({ ...acc, [i]: r }), {})}
        disabled={isDisabled}
      />
      <Spacer
        width="28%"
        style={{
          marginTop: "-6.75rem",
          left: "-0.25rem",
        }}
      >
        <Title
          size="md"
          style={{
            paddingTop: "0.55rem",
            paddingBottom: "0.75rem",
          }}
        >
          Oscillator - 1
        </Title>
        <Title size="sm">Frequency</Title>
      </Spacer>
      <Knob
        type="arrow"
        size="large"
        value={waveforms.indexOf(oscillator1.waveform)}
        min={0}
        max={waveforms.length - 1}
        step={1}
        label="Waveform"
        id="osc1-waveform"
        onChange={handleWaveformChange}
        valueLabels={waveformIcons.reduce(
          (acc, icon, i) => ({ ...acc, [i]: icon }),
          {}
        )}
        disabled={isDisabled}
      />
    </OscillatorPanel>
  );
}
