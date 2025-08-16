import { useState, ReactNode } from "react";
import { Rnd } from "react-rnd";
import Title from "../Title";
import styles from "./EffectsPanel.module.css";

type EffectsPanelProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  defaultPosition?: { x: number; y: number };
  minWidth?: number;
  minHeight?: number;
};

export default function EffectsPanel({
  title,
  onClose,
  children,
  defaultPosition = { x: window.innerWidth - 320, y: 100 },
  minWidth = 300,
  minHeight = 200,
}: EffectsPanelProps) {
  const [panelPosition, setPanelPosition] = useState(defaultPosition);

  return (
    <Rnd
      className={styles.effectsPanel}
      position={panelPosition}
      onDragStop={(_e, d) => setPanelPosition({ x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, _ref, _delta, position) => {
        setPanelPosition(position);
      }}
      bounds="window"
      minWidth={minWidth}
      minHeight={minHeight}
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
        <Title size="lg">{title}</Title>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()} panel`}
        >
          ×
        </button>
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </Rnd>
  );
}
