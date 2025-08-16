import Knob from "../Knob";
import Column from "../Column";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import EffectsPanel from "../EffectsPanel";
import { useSynthStore } from "@/store/synthStore";

type ReverbProps = {
  onClose: () => void;
};

export default function Reverb({ onClose }: ReverbProps) {
  const { reverb, setReverb } = useSynthStore();

  function handleMixChange(value: number) {
    setReverb({ mix: Number(value.toFixed(1)) });
  }

  function handleDecayChange(value: number) {
    setReverb({ decay: Number(value.toFixed(1)) });
  }

  function handleToneChange(value: number) {
    setReverb({ tone: Number(value.toFixed(1)) });
  }

  return (
    <EffectsPanel title="Reverb Effect" onClose={onClose}>
      <Column gap="var(--spacing-lg)">
        <Row justify="center" style={{ marginBottom: "var(--spacing-md)" }}>
          <RockerSwitch
            theme="blue"
            checked={reverb.enabled}
            onCheckedChange={(checked) => setReverb({ enabled: checked })}
            label="Reverb"
            bottomLabelRight="On"
            bottomLabelLeft="Off"
          />
        </Row>
        <Row gap="var(--spacing-xl)" justify="space-between">
          <Knob
            type="radial"
            value={reverb.mix}
            min={0}
            max={10}
            step={0.1}
            label="Mix"
            id="reverb-mix"
            onChange={handleMixChange}
            unit=""
            size="medium"
            valueLabels={{
              0: "Dry",
              2.5: "",
              5: "50%",
              7.5: "",
              10: "Wet",
            }}
          />
          <Knob
            type="radial"
            value={reverb.decay}
            min={0}
            max={10}
            step={0.1}
            label="Decay"
            id="reverb-decay"
            onChange={handleDecayChange}
            unit="s"
            size="medium"
            valueLabels={{
              0: "0",
              2: "2",
              4: "4",
              6: "6",
              8: "8",
              10: "10",
            }}
          />
          <Knob
            type="radial"
            value={reverb.tone}
            min={0}
            max={10}
            step={0.1}
            label="Tone"
            id="reverb-tone"
            onChange={handleToneChange}
            unit=""
            size="medium"
            valueLabels={{
              0: "Bass",
              2.5: "",
              5: "Mid",
              7.5: "",
              10: "Treble",
            }}
          />
        </Row>
      </Column>
    </EffectsPanel>
  );
}
