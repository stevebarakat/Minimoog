import Knob from "../Knob";
import Column from "../Column";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import DraggablePanel from "../DraggablePanel";
import { useSynthStore } from "@/store/synthStore";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

type ReverbProps = {
  onClose: () => void;
  panelIndex?: number;
  initialPosition?: { x: number; y: number };
  onPositionUpdate?: (position: { x: number; y: number }) => void;
};

export default function Reverb({
  onClose,
  panelIndex = 0,
  initialPosition,
  onPositionUpdate,
}: ReverbProps) {
  const { reverb, setReverb } = useSynthStore();

  function handleMixChange(value: number) {
    setReverb({ mix: Number(value.toFixed(1)) });
  }

  function handleToneChange(value: number) {
    setReverb({ tone: Number(value.toFixed(1)) });
  }

  return (
    <DraggablePanel
      title="Reverb"
      onClose={onClose}
      panelIndex={panelIndex}
      defaultPosition={initialPosition}
      onPositionUpdate={onPositionUpdate}
    >
      <Column gap="var(--spacing-lg)">
        <Row justify="center" style={{ marginBottom: "var(--spacing-md)" }}>
          <Tooltip content={getTooltipContent("reverb")}>
            <RockerSwitch
              theme="blue"
              checked={reverb.enabled}
              onCheckedChange={(checked) => setReverb({ enabled: checked })}
              label="Reverb"
              bottomLabelRight="On"
            />
          </Tooltip>
        </Row>
        <Row gap="var(--spacing-xl)" justify="space-between">
          <Tooltip content={getTooltipContent("reverb-amount")}>
            <Knob
              type="radial"
              value={reverb.mix}
              min={0}
              max={10}
              step={0.1}
              label="Amount"
              id="reverb-amount"
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

          <Tooltip content={getTooltipContent("reverb-tone")}>
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
          </Tooltip>
        </Row>
      </Column>
    </DraggablePanel>
  );
}
