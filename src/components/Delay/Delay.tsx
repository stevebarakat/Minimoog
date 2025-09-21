import Knob from "../Knob";
import Column from "../Column";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import DraggablePanel from "../DraggablePanel";
import { useDelayState } from "@/store/selectors";
import { useSynthStore } from "@/store/synthStore";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

type DelayProps = {
  onClose: () => void;
  panelIndex?: number;
  initialPosition?: { x: number; y: number };
  onPositionUpdate?: (position: { x: number; y: number }) => void;
};

export default function Delay({
  onClose,
  panelIndex = 0,
  initialPosition,
  onPositionUpdate,
}: DelayProps) {
  const delay = useDelayState();
  const { setDelay } = useSynthStore();

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
    <DraggablePanel
      title="Delay"
      onClose={onClose}
      panelIndex={panelIndex}
      defaultPosition={initialPosition}
      onPositionUpdate={onPositionUpdate}
    >
      <Row
        gap="var(--spacing-lg)"
        justify="space-between"
        style={{ padding: "0 0.5rem 0 0" }}
      >
        <Column
          justify="space-between"
          gap="2rem"
          style={{ marginTop: "1.25rem" }}
        >
          <Tooltip content={getTooltipContent("delay")}>
            <RockerSwitch
              orientation="vertical"
              theme="blue"
              checked={delay.enabled}
              onCheckedChange={(checked) => setDelay({ enabled: checked })}
              label="Delay"
              topLabel="On"
            />
          </Tooltip>
          <Tooltip content={getTooltipContent("delay-mix")}>
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
          </Tooltip>
        </Column>
        <Column gap="var(--spacing-xl)" justify="space-between">
          <Tooltip content={getTooltipContent("delay-time")}>
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
          </Tooltip>
          <Tooltip content={getTooltipContent("delay-feedback")}>
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
          </Tooltip>
        </Column>
      </Row>
    </DraggablePanel>
  );
}
