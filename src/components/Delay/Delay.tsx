import { useState } from "react";
import { Rnd } from "react-rnd";
import Knob from "../Knob";
import Title from "../Title";
import Column from "../Column";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import styles from "./Delay.module.css";

type DelayProps = {
  onClose: () => void;
};

export default function Delay({ onClose }: DelayProps) {
  const { delay, setDelay } = useSynthStore();

  // Panel position and size state
  const [panelPosition, setPanelPosition] = useState({
    x: window.innerWidth - 320,
    y: 100,
  });

  const handleMixChange = (value: number) => {
    setDelay({ mix: Number(value.toFixed(1)) });
  };

  const handleTimeChange = (value: number) => {
    setDelay({ time: Number(value.toFixed(1)) });
  };

  const handleFeedbackChange = (value: number) => {
    setDelay({ feedback: Number(value.toFixed(1)) });
  };

  return (
    <Rnd
      className={styles.delayPanel}
      position={panelPosition}
      onDragStop={(_e, d) => setPanelPosition({ x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, _ref, _delta, position) => {
        setPanelPosition(position);
      }}
      bounds="window"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <div className={styles.header}>
        <Title size="lg">Delay Effect</Title>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close delay panel"
        >
          ×
        </button>
      </div>

      <Column gap="var(--spacing-lg)" style={{ padding: "var(--spacing-md)" }}>
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
              2: "0.4",
              4: "0.8",
              6: "1.2",
              8: "1.6",
              10: "2",
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
    </Rnd>
  );
}
