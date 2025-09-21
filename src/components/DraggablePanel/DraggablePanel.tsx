import { useState, ReactNode } from "react";
import { Rnd } from "react-rnd";
import { X } from "lucide-react";
import Title from "../Title";
import styles from "./DraggablePanel.module.css";

type DraggablePanelProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  defaultPosition?: { x: number; y: number };
  onPositionUpdate?: (position: { x: number; y: number }) => void;
  minWidth?: number;
  minHeight?: number;
  panelIndex?: number; // For staggering multiple panels
};

export default function DraggablePanel({
  title,
  onClose,
  children,
  defaultPosition,
  onPositionUpdate,
  minWidth = 150,
  minHeight = 200,
  panelIndex = 0,
}: DraggablePanelProps) {
  // Simple default positioning - just stagger panels
  const getSafeDefaultPosition = () => {
    const margin = 20;
    const staggerOffset = 40;

    return {
      x: margin + panelIndex * staggerOffset,
      y: margin + panelIndex * staggerOffset,
    };
  };

  const [panelPosition, setPanelPosition] = useState(
    defaultPosition || getSafeDefaultPosition()
  );

  return (
    <Rnd
      className={styles.effectsPanel}
      position={panelPosition}
      onDragStop={(_e, d) => {
        const newPosition = { x: d.x, y: d.y };
        setPanelPosition(newPosition);
        onPositionUpdate?.(newPosition);
      }}
      onResizeStop={(_e, _direction, _ref, _delta, position) => {
        setPanelPosition(position);
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <Title size="lg">{title}</Title>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()} panel`}
          >
            <X width={24} height={24} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </Rnd>
  );
}
