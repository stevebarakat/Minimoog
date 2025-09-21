import { useSynthStore } from "@/store/synthStore";
import { useOscillator2State } from "@/store/selectors";
import OscillatorPanel from "./OscillatorPanel";
import Knob from "@/components/Knob/Knob";
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
import Spacer from "@/components/Spacer/Spacer";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipContent } from "@/utils";

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

export default function Oscillator2() {
  const oscillator2 = useOscillator2State();
  const { setOscillator2 } = useSynthStore();
  const isDisabled = useSynthStore((state) => !state.audioContext.isReady);

  function handleWaveformChange(value: number) {
    setOscillator2({ waveform: waveforms[Math.round(value)] });
  }
  function handleRangeChange(value: number) {
    setOscillator2({ range: ranges[Math.round(value)] });
  }
  function handleFrequencyChange(value: number) {
    setOscillator2({ frequency: value });
  }

  return (
    <OscillatorPanel style={{ paddingBottom: ".5rem", left: "0.25rem" }}>
      <Spacer width="2.5rem" />
      <Tooltip content={getTooltipContent("oscillator-2-range")}>
        <Knob
          type="arrow"
          size="large"
          value={ranges.indexOf(oscillator2.range)}
          min={0}
          max={ranges.length - 1}
          step={1}
          label="Range"
          title=" "
          id="osc2-range"
          onChange={handleRangeChange}
          valueLabels={ranges.reduce((acc, r, i) => ({ ...acc, [i]: r }), {})}
          disabled={isDisabled}
        />
      </Tooltip>
      <Tooltip content={getTooltipContent("oscillator-2-frequency")}>
        <Knob
          size="large"
          value={oscillator2.frequency}
          min={-8}
          max={8}
          step={1}
          label="Oscillator 2 Frequency"
          title="Oscillator - 2"
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
      </Tooltip>
      <Tooltip content={getTooltipContent("oscillator-2-waveform")}>
        <Knob
          type="arrow"
          size="large"
          value={waveforms.indexOf(oscillator2.waveform)}
          min={0}
          max={waveforms.length - 1}
          step={1}
          label="Waveform"
          title=" "
          id="osc2-waveform"
          onChange={handleWaveformChange}
          valueLabels={waveformIcons.reduce(
            (acc, icon, i) => ({ ...acc, [i]: icon }),
            {}
          )}
          disabled={isDisabled}
        />
      </Tooltip>
    </OscillatorPanel>
  );
}
