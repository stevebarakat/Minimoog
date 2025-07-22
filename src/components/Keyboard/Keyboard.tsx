import { useState, useCallback, useEffect, useRef } from "react";
import styles from "./Keyboard.module.css";
import type { KeyboardProps } from "./types";
import { WhiteKey, BlackKey } from "./components";
import {
  generateKeyboardKeys,
  getNoteFromKeyEvent,
  calculateBlackKeyPosition,
  FIXED_OCTAVE,
} from "./utils";
import { useSynthStore } from "@/store/synthStore";

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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]); // Track all pressed keys
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

  const handleKeyPress = useCallback(
    (note: string): void => {
      if (isReleasing || isDisabled) return;

      setPressedKeys((prev) => {
        const newPressedKeys = prev.includes(note) ? prev : [...prev, note];
        return newPressedKeys;
      });

      if (activeKeys && activeKeys !== note) {
        synth.triggerAttack(note);
        onKeyDown(note);
      } else if (!activeKeys) {
        synth.triggerAttack(note);
        onKeyDown(note);
      }
    },
    [isReleasing, isDisabled, synth, onKeyDown, activeKeys]
  );

  const handleKeyRelease = useCallback(
    (note: string): void => {
      if (isReleasing || isDisabled) return;

      setPressedKeys((prev) => {
        const newPressedKeys = prev.filter((key) => key !== note);
        return newPressedKeys;
      });

      if (note === activeKeys) {
        const remainingKeys = pressedKeys.filter((key) => key !== note);

        if (remainingKeys.length > 0) {
          const nextKey = remainingKeys[remainingKeys.length - 1];
          synth.triggerAttack(nextKey);
          onKeyDown(nextKey);
        } else {
          setIsReleasing(true);
          synth.triggerRelease(note);
          onKeyUp(note);
          setIsReleasing(false);
        }
      }
    },
    [
      isReleasing,
      isDisabled,
      synth,
      onKeyDown,
      onKeyUp,
      activeKeys,
      pressedKeys,
    ]
  );

  const handleMouseDown = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    setIsMouseDown(true);
    onMouseDown();
  }, [onMouseDown, isReleasing, isDisabled]);

  const handleMouseUp = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    setIsMouseDown(false);
    if (activeKeys && pressedKeys.length === 0) {
      setIsReleasing(true);
      synth.triggerRelease(activeKeys);
      onKeyUp(activeKeys);
      setIsReleasing(false);
    }
    onMouseUp();
  }, [
    activeKeys,
    onKeyUp,
    onMouseUp,
    synth,
    isReleasing,
    pressedKeys,
    isDisabled,
  ]);

  const handleMouseLeave = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    if (isMouseDown) {
      setIsMouseDown(false);
      if (activeKeys && pressedKeys.length === 0) {
        setIsReleasing(true);
        synth.triggerRelease(activeKeys);
        onKeyUp(activeKeys);
        setIsReleasing(false);
      }
      onMouseUp();
    }
  }, [
    isMouseDown,
    activeKeys,
    onKeyUp,
    onMouseUp,
    synth,
    isReleasing,
    pressedKeys,
    isDisabled,
  ]);

  const handleKeyInteraction = useCallback(
    (note: string): void => {
      if (isMouseDown && !isDisabled) {
        handleKeyPress(note);
      }
    },
    [isMouseDown, handleKeyPress, isDisabled]
  );

  const handleKeyLeave = useCallback(
    (note: string): void => {
      if (isMouseDown && !isDisabled) {
        handleKeyRelease(note);
      }
    },
    [isMouseDown, handleKeyRelease, isDisabled]
  );

  // Keyboard event handlers for the container
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!e.key || isDisabled) return;
      const note = getNoteFromKeyEvent(e.key, FIXED_OCTAVE);
      if (note && !e.repeat) {
        handleKeyPress(note);
      }
    },
    [handleKeyPress, isDisabled]
  );

  const handleContainerKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!e.key || isDisabled) return;
      const note = getNoteFromKeyEvent(e.key, FIXED_OCTAVE);
      if (note) {
        handleKeyRelease(note);
      }
    },
    [handleKeyRelease, isDisabled]
  );

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
      onKeyDown={handleContainerKeyDown}
      onKeyUp={handleContainerKeyUp}
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
      </div>
    </div>
  );
}

export default Keyboard;
