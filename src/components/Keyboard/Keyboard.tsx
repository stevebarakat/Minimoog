import { useRef, useEffect, useCallback, useState } from "react";
import styles from "./Keyboard.module.css";
import type { KeyboardProps } from "./types";
import { WhiteKey, BlackKey } from "./components";
import { generateKeyboardKeys, calculateBlackKeyPosition } from "./utils";
import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "./hooks/useKeyboardState";
import { useKeyboardHandlers } from "./hooks/useKeyboardHandlers";
import { KEYBOARD } from "@/config";
import {
  getNoteForKey,
  QWERTY_KEYS,
  OCTAVE_DOWN_KEYS,
  OCTAVE_UP_KEYS,
} from "./utils/keyboardMapping";

export function Keyboard({
  activeKeys = null,
  octaveRange = KEYBOARD.DEFAULTS.OCTAVE_RANGE,
  extraKeys = KEYBOARD.DEFAULTS.EXTRA_KEYS,
  onKeyDown = () => {},
  onKeyUp = () => {},
  onMouseDown = () => {},
  onMouseUp = () => {},
  synth,
  view = KEYBOARD.DEFAULTS.VIEW,
}: KeyboardProps) {
  const isDisabled = useSynthStore((state) => state.isDisabled);
  const allKeys = generateKeyboardKeys(octaveRange, extraKeys);
  const containerRef = useRef<HTMLDivElement>(null);

  // Remove last 12 keys for tablet view, last 19 keys for mobile view
  const keys =
    view === "mobile"
      ? allKeys.slice(0, -19)
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
    synth,
    activeKeys,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    isDisabled,
  });

  // Track octave offset for shifting
  const [octaveOffset, setOctaveOffset] = useState(0);
  const octaveOffsetRef = useRef(octaveOffset);
  const isDisabledRef = useRef(isDisabled);

  // Update refs when values change
  useEffect(() => {
    octaveOffsetRef.current = octaveOffset;
  }, [octaveOffset]);

  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

  // QWERTY keyboard event handlers - use refs to avoid recreation
  const handleQwertyKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if not disabled
      if (isDisabledRef.current) return;
      // Prevent browser shortcuts for mapped keys
      if (
        QWERTY_KEYS.includes(e.key) ||
        OCTAVE_DOWN_KEYS.includes(e.key) ||
        OCTAVE_UP_KEYS.includes(e.key)
      ) {
        e.preventDefault();
      }
      // Octave shift
      if (OCTAVE_DOWN_KEYS.includes(e.key)) {
        setOctaveOffset((prev) => Math.max(prev - 1, -2));
        return;
      }
      if (OCTAVE_UP_KEYS.includes(e.key)) {
        setOctaveOffset((prev) => Math.min(prev + 1, 2));
        return;
      }
      // Map QWERTY key to note
      const note = getNoteForKey(e.key, octaveOffsetRef.current);
      if (note) {
        handleKeyPress(note);
      }
    },
    [handleKeyPress]
  );

  const handleQwertyKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (isDisabledRef.current) return;
      if (QWERTY_KEYS.includes(e.key)) {
        e.preventDefault();
        const note = getNoteForKey(e.key, octaveOffsetRef.current);
        if (note) {
          handleKeyRelease(note);
        }
      }
    },
    [handleKeyRelease]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleQwertyKeyDown);
    window.addEventListener("keyup", handleQwertyKeyUp);
    return () => {
      window.removeEventListener("keydown", handleQwertyKeyDown);
      window.removeEventListener("keyup", handleQwertyKeyUp);
    };
  }, [handleQwertyKeyDown, handleQwertyKeyUp]);

  // Calculate white key width based on container width
  const whiteKeyWidth = 100 / keys.filter((key) => !key.isSharp).length;

  return (
    <div
      ref={containerRef}
      className={styles.keyboard}
      data-testid="keyboard-container"
      data-onboarding="keyboard"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* White keys container */}
      <div className={styles.pianoKeys}>
        {keys.map((key) => {
          if (!key.isSharp) {
            return (
              <WhiteKey
                key={`white-${key.note}`}
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
            );
          }
          return null;
        })}
      </div>

      {/* Black keys */}
      {keys.map((key, index) => {
        if (key.isSharp) {
          const position = calculateBlackKeyPosition(
            index,
            keys,
            whiteKeyWidth
          );
          if (position) {
            return (
              <BlackKey
                key={`black-${key.note}`}
                note={key.note}
                isActive={activeKeys === key.note}
                position={position.position}
                width={position.width}
                onPointerDown={() => {
                  handleMouseDown();
                  handleKeyPress(key.note);
                }}
                onPointerUp={() => handleKeyRelease(key.note)}
                onPointerEnter={() => handleKeyInteraction(key.note)}
                onPointerLeave={() => handleKeyLeave(key.note)}
              />
            );
          }
        }
        return null;
      })}
    </div>
  );
}

export default Keyboard;
