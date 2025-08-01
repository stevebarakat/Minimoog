import { useSynthStore } from "@/store/synthStore";
import OscillatorPanel from "./OscillatorPanel";
import Knob from "@/components/Knob/Knob";
import {
  TriangleIcon,
  SawtoothIcon,
  ReverseSawIcon,
  SquareIcon,
  WidePulseIcon,
  NarrowPulseIcon,
} from "../icons/WaveformIcons";
import { OscillatorWaveform, OscillatorRange } from "@/store/types/synth";

const waveforms: OscillatorWaveform[] = [
  "triangle",
  "sawtooth",
  "rev_saw",
  "pulse1",
  "pulse2",
  "pulse3",
];
const waveformIcons = [
  <TriangleIcon key="triangle" />,
  <SawtoothIcon key="sawtooth" />,
  <ReverseSawIcon key="rev_saw" />,
  <SquareIcon key="pulse1" />,
  <WidePulseIcon key="pulse2" />,
  <NarrowPulseIcon key="pulse3" />,
];
const ranges: OscillatorRange[] = ["lo", "32", "16", "8", "4", "2"];

export default function Oscillator3() {
  const { oscillator3, setOscillator3, isDisabled } = useSynthStore();
  const osc3Control = useSynthStore((state) => state.osc3Control);
  const setOsc3Control = useSynthStore((state) => state.setOsc3Control);

  function handleWaveformChange(value: number) {
    setOscillator3({ waveform: waveforms[Math.round(value)] });
  }
  function handleRangeChange(value: number) {
    setOscillator3({ range: ranges[Math.round(value)] });
  }
  function handleFrequencyChange(value: number) {
    setOscillator3({ frequency: value });
  }

  return (
    <OscillatorPanel
      showControlSwitch
      controlSwitchProps={{
        checked: osc3Control,
        onCheckedChange: setOsc3Control,
        label: "Osc. 3 Control",
        theme: "orange",
      }}
      isDisabled={isDisabled}
    >
      <Knob
        type="arrow"
        size="large"
        value={ranges.indexOf(oscillator3.range)}
        min={0}
        max={ranges.length - 1}
        step={1}
        title=" "
        label="Range"
        onChange={handleRangeChange}
        valueLabels={ranges.reduce((acc, r, i) => ({ ...acc, [i]: r }), {})}
        disabled={isDisabled}
      />
      <Knob
        size="large"
        value={oscillator3.frequency}
        min={-7}
        max={7}
        step={1}
        label="Oscillator 3 Frequency"
        title="Oscillator - 3"
        unit=""
        onChange={handleFrequencyChange}
        valueLabels={{
          "-7": "-7",
          "-5": "-5",
          "-3": "-3",
          "-1": "-1",
          "1": "1",
          "3": "3",
          "5": "5",
          "7": "7",
        }}
        disabled={isDisabled}
      />
      <Knob
        type="arrow"
        size="large"
        value={waveforms.indexOf(oscillator3.waveform)}
        min={0}
        max={waveforms.length - 1}
        step={1}
        label="Waveform"
        title=" "
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
