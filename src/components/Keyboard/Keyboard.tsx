import { useRef, useEffect, useCallback } from "react";
import styles from "./Keyboard.module.css";
import type { KeyboardProps } from "./types";
import { WhiteKey, BlackKey } from "./components";
import { generateKeyboardKeys, calculateBlackKeyPosition } from "./utils";
import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "./hooks/useKeyboardState";
import { useKeyboardHandlers } from "./hooks/useKeyboardHandlers";

export function Keyboard({
  activeKeys = null,
  octaveRange = { min: 1, max: 4 },
  onKeyDown = () => {},
  onKeyUp = () => {},
  onMouseDown = () => {},
  onMouseUp = () => {},
  synth,
  view = "desktop",
}: KeyboardProps) {
  const isDisabled = useSynthStore((state) => state.isDisabled);
  const allKeys = generateKeyboardKeys(octaveRange);
  const containerRef = useRef<HTMLDivElement>(null);

  // Remove last 12 keys for tablet view, last 24 keys for mobile view
  const keys =
    view === "mobile"
      ? allKeys.slice(0, -24)
      : view === "tablet"
      ? allKeys.slice(0, -12)
      : allKeys;

  // Use extracted state hook
  const {
    isMouseDown,
    setIsMouseDown,
    isReleasing,
    setIsReleasing,
    pressedKeys,
    setPressedKeys,
    octaveOffset,
    setOctaveOffset,
  } = useKeyboardState();

  // Use extracted handlers hook
  const {
    handleKeyPress,
    handleKeyRelease,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleKeyInteraction,
    handleKeyLeave,
  } = useKeyboardHandlers({
    isMouseDown,
    setIsMouseDown,
    isReleasing,
    setIsReleasing,
    pressedKeys,
    setPressedKeys,
    setOctaveOffset,
    synth,
    activeKeys,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    isDisabled,
  });

  // Focus the container on mount for keyboard accessibility
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const renderWhiteKeys = useCallback(() => {
    return keys
      .filter((key) => !key.isSharp)
      .map((key, index) => (
        <WhiteKey
          key={`white-${key.note}-${index}`}
          note={key.note}
          isActive={activeKeys === key.note}
          onPointerDown={() => {
            handleMouseDown();
            handleKeyPress(key.note);
          }}
          onPointerUp={() => handleKeyRelease(key.note)}
          onPointerEnter={() => handleKeyInteraction(key.note)}
          onPointerLeave={() => handleKeyLeave(key.note)}
        />
      ));
  }, [
    keys,
    activeKeys,
    handleMouseDown,
    handleKeyPress,
    handleKeyRelease,
    handleKeyInteraction,
    handleKeyLeave,
  ]);

  const renderBlackKeys = useCallback(() => {
    const whiteKeys = keys.filter((key) => !key.isSharp);
    const whiteKeyWidth = 100 / whiteKeys.length;

    return keys
      .map((key, idx) => ({ ...key, idx }))
      .filter((key) => key.isSharp)
      .map((blackKey, bIdx) => {
        const positionData = calculateBlackKeyPosition(
          blackKey.idx,
          keys,
          whiteKeyWidth
        );
        if (!positionData) return null;

        return (
          <BlackKey
            key={`black-${blackKey.note}-${bIdx}`}
            note={blackKey.note}
            isActive={activeKeys === blackKey.note}
            position={positionData.position}
            width={positionData.width}
            onPointerDown={() => {
              handleMouseDown();
              handleKeyPress(blackKey.note);
            }}
            onPointerUp={() => handleKeyRelease(blackKey.note)}
            onPointerEnter={() => handleKeyInteraction(blackKey.note)}
            onPointerLeave={() => handleKeyLeave(blackKey.note)}
          />
        );
      });
  }, [
    keys,
    activeKeys,
    handleMouseDown,
    handleKeyPress,
    handleKeyRelease,
    handleKeyInteraction,
    handleKeyLeave,
  ]);

  return (
    <div
      ref={containerRef}
      className={styles.keyboardContainer}
      tabIndex={0}
      data-testid="keyboard-container"
      onPointerUp={handleMouseUp}
      onPointerLeave={handleMouseLeave}
    >
      <div className={styles.keyboard}>
        <div className={styles.pianoKeys}>
          {renderWhiteKeys()}
          {renderBlackKeys()}
          <div className={styles.leftShadow} />
          <div className={styles.rightShadow} />
        </div>
        {/* Octave indicator */}
        {octaveOffset !== 0 && (
          <div className={styles.octaveIndicator}>
            {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}
          </div>
        )}
      </div>
    </div>
  );
}

export default Keyboard;
