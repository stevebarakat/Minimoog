import Knob from "../Knob";
import Column from "../Column";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import EffectsPanel from "../EffectsPanel";
import { useSynthStore } from "@/store/synthStore";

type DelayProps = {
  onClose: () => void;
};

export default function Delay({ onClose }: DelayProps) {
  const { delay, setDelay } = useSynthStore();

  function handleMixChange(value: number) {
    setDelay({ mix: Number(value.toFixed(1)) });
  }

  function handleTimeChange(value: number) {
    setDelay({ time: Number(value.toFixed(1)) });
  }

  function handleFeedbackChange(value: number) {
    setDelay({ feedback: Number(value.toFixed(1)) });
  }

  return (
    <EffectsPanel title="Delay Effect" onClose={onClose}>
      <Column gap="var(--spacing-lg)">
        <Row justify="center" style={{ marginBottom: "var(--spacing-md)" }}>
          <RockerSwitch
            theme="blue"
            checked={delay.enabled}
            onCheckedChange={(checked) => setDelay({ enabled: checked })}
            label="Delay Effect"
            bottomLabelRight="On"
            bottomLabelLeft="Off"
          />
        </Row>
        <Row gap="var(--spacing-xl)" justify="space-between">
          <Knob
            type="radial"
            value={delay.mix}
            min={0}
            max={10}
            step={0.1}
            label="Mix"
            id="delay-mix"
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
            value={delay.time}
            min={0}
            max={10}
            step={0.1}
            label="Time"
            id="delay-time"
            onChange={handleTimeChange}
            unit="ms"
            size="medium"
            valueLabels={{
              0: "0",
              2: "0.2",
              4: "0.4",
              6: "0.6",
              8: "0.8",
              10: "1.0",
            }}
          />
          <Knob
            type="radial"
            value={delay.feedback}
            min={0}
            max={10}
            step={0.1}
            label="Feedback"
            id="delay-feedback"
            onChange={handleFeedbackChange}
            unit=""
            size="medium"
            valueLabels={{
              0: "0%",
              2: "18%",
              4: "36%",
              6: "54%",
              8: "72%",
              10: "90%",
            }}
          />
        </Row>
      </Column>
    </EffectsPanel>
  );
}
