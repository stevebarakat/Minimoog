import { useRef, useEffect, useCallback, useState } from "react";
import styles from "./Keyboard.module.css";
import type { KeyboardProps } from "./types";
import { WhiteKey, BlackKey } from "./components";
import { generateKeyboardKeys, calculateBlackKeyPosition } from "@/utils";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { useKeyboardState } from "./hooks/useKeyboardState";
import { useKeyboardHandlers } from "./hooks/useKeyboardHandlers";
import { KEYBOARD } from "@/config";
import {
  getNoteForKey,
  QWERTY_KEYS,
  OCTAVE_DOWN_KEYS,
  OCTAVE_UP_KEYS,
  PITCH_BEND_DOWN_KEYS,
  PITCH_BEND_UP_KEYS,
  MOD_AMOUNT_KEYS,
} from "./utils/keyboardMapping";
import {
  safePreventDefault,
  shouldInterceptKeyboardEvent,
  isSynthFocused,
} from "@/utils";

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
  const isDisabled = useIsSynthDisabled();
  const setPitchWheel = useSynthStore((state) => state.setPitchWheel);
  const setModWheel = useSynthStore((state) => state.setModWheel);
  const pitchWheel = useSynthStore((state) => state.pitchWheel);

  const pitchRampAnimationRef = useRef<number | null>(null);
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
  const { isMouseDown, setIsMouseDown, pressedKeys, setPressedKeys } =
    useKeyboardState();

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

  // Smooth pitch bend using exponential easing
  const rampPitchTo = useCallback(
    (targetValue: number, rampTime: number = 0.1) => {
      // Cancel any existing animation
      if (pitchRampAnimationRef.current) {
        cancelAnimationFrame(pitchRampAnimationRef.current);
      }

      const startValue = pitchWheel;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (rampTime * 1000), 1);

        // Exponential easing out function
        const easedProgress = 1 - Math.pow(2, -10 * progress);
        const currentValue =
          startValue + (targetValue - startValue) * easedProgress;

        setPitchWheel(Math.round(currentValue));

        if (progress < 1) {
          pitchRampAnimationRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure we hit the exact target value
          setPitchWheel(targetValue);
          pitchRampAnimationRef.current = null;
        }
      };

      pitchRampAnimationRef.current = requestAnimationFrame(animate);
    },
    [pitchWheel, setPitchWheel]
  );

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (pitchRampAnimationRef.current) {
        cancelAnimationFrame(pitchRampAnimationRef.current);
      }
    };
  }, []);

  // QWERTY keyboard event handlers - use refs to avoid recreation
  const handleQwertyKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if not disabled
      if (isDisabledRef.current) return;

      // Ignore repeated keydown events to prevent sound looping when keys are held
      if (e.repeat) return;

      // Check if we should intercept this keyboard event
      if (!shouldInterceptKeyboardEvent(e) || !isSynthFocused()) {
        return;
      }

      // Create list of all keys we want to handle
      const allSynthKeys = [
        ...QWERTY_KEYS,
        ...OCTAVE_DOWN_KEYS,
        ...OCTAVE_UP_KEYS,
        ...PITCH_BEND_DOWN_KEYS,
        ...PITCH_BEND_UP_KEYS,
        ...Object.keys(MOD_AMOUNT_KEYS),
      ];

      // Only prevent default for keys we actually handle
      const shouldPrevent = safePreventDefault(e, allSynthKeys);
      if (!shouldPrevent) return;

      // Octave shift
      if (OCTAVE_DOWN_KEYS.includes(e.key)) {
        setOctaveOffset((prev) => Math.max(prev - 1, -2));
        return;
      }
      if (OCTAVE_UP_KEYS.includes(e.key)) {
        setOctaveOffset((prev) => Math.min(prev + 1, 2));
        return;
      }

      // Pitch bend controls - smooth ramping
      if (PITCH_BEND_DOWN_KEYS.includes(e.key)) {
        rampPitchTo(0, 0.6); // Ramp to full down in 600ms
        return;
      }
      if (PITCH_BEND_UP_KEYS.includes(e.key)) {
        rampPitchTo(100, 0.6); // Ramp to full up in 600ms
        return;
      }

      // Direct modulation amount setting
      if (e.key in MOD_AMOUNT_KEYS) {
        const modAmount =
          MOD_AMOUNT_KEYS[e.key as keyof typeof MOD_AMOUNT_KEYS];
        setModWheel(modAmount);
        return;
      }

      // Map QWERTY key to note
      const note = getNoteForKey(e.key, octaveOffsetRef.current);
      if (note) {
        handleKeyPress(note);
      }
    },
    [handleKeyPress, rampPitchTo, setModWheel]
  );

  const handleQwertyKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (isDisabledRef.current) return;

      // Check if we should intercept this keyboard event
      if (!shouldInterceptKeyboardEvent(e) || !isSynthFocused()) {
        return;
      }

      // Smooth return to center when pitch bend keys are released
      if (
        PITCH_BEND_DOWN_KEYS.includes(e.key) ||
        PITCH_BEND_UP_KEYS.includes(e.key)
      ) {
        rampPitchTo(50, 0.8); // Ramp back to center in 800ms
        return;
      }

      // Modulation keys don't need release handling - they set absolute values

      if (QWERTY_KEYS.includes(e.key)) {
        // Only prevent default if we successfully intercepted on keydown
        const shouldPrevent = safePreventDefault(e, QWERTY_KEYS);
        if (shouldPrevent) {
          const note = getNoteForKey(e.key, octaveOffsetRef.current);
          if (note) {
            handleKeyRelease(note);
          }
        }
      }
    },
    [handleKeyRelease, rampPitchTo]
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
