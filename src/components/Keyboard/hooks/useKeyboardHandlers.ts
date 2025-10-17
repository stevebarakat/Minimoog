import { useCallback } from "react";
import type { UseKeyboardHandlersProps } from "./types";
import { track } from "@vercel/analytics";
import { useSynthStore } from "@/store/synthStore";

export function useKeyboardHandlers({
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
}: UseKeyboardHandlersProps) {
  const glideOn = useSynthStore((state) => state.glideOn);

  const handleKeyPress = useCallback(
    (note: string): void => {
      if (isDisabled || !synth) return;

      // Prevent duplicate key triggering - if note is already pressed, don't trigger again
      if (pressedKeys.includes(note)) return;

      setPressedKeys((previousKeys) => {
        const updatedKeys = previousKeys.includes(note)
          ? previousKeys
          : [...previousKeys, note];
        return updatedKeys;
      });

      // Track keyboard usage
      track("keyboard_press", {
        note: note,
        octave: note.replace(/[A-G]#?/, ""),
      });

      setTimeout(() => {
        synth.triggerAttack(note);
        onKeyDown(note);
      }, 5);
    },
    [isDisabled, synth, onKeyDown, setPressedKeys, pressedKeys]
  );

  const handleKeyRelease = useCallback(
    (note: string): void => {
      if (isDisabled || !synth) return;

      setPressedKeys((previousKeys) => {
        const remainingKeys = previousKeys.filter((key) => key !== note);
        return remainingKeys;
      });

      // Check if this was the currently active note
      if (note === activeKeys) {
        const stillPressedKeys = pressedKeys.filter((key) => key !== note);
        if (stillPressedKeys.length > 0) {
          const nextKey = stillPressedKeys[stillPressedKeys.length - 1];

          if (glideOn) {
            synth.triggerAttack(nextKey);
            onKeyDown(nextKey);
          } else {
            synth.triggerRelease(note);

            setTimeout(() => {
              synth.triggerAttack(nextKey);
              onKeyDown(nextKey);
            }, 10);
          }
        } else {
          synth.triggerRelease(note);
          onKeyUp(note);
        }
      }
    },
    [
      isDisabled,
      synth,
      onKeyDown,
      onKeyUp,
      activeKeys,
      pressedKeys,
      setPressedKeys,
      glideOn,
    ]
  );

  const handleMouseDown = useCallback((): void => {
    if (isDisabled) return;
    setIsMouseDown(true);
    onMouseDown();
  }, [onMouseDown, isDisabled, setIsMouseDown]);

  const handleMouseUp = useCallback((): void => {
    if (isDisabled) return;
    setIsMouseDown(false);
    onMouseUp();
  }, [onMouseUp, isDisabled, setIsMouseDown]);

  const handleMouseLeave = useCallback((): void => {
    if (isDisabled) return;
    setIsMouseDown(false);
  }, [isDisabled, setIsMouseDown]);

  const handleKeyInteraction = useCallback(
    (note: string): void => {
      if (isDisabled) return;

      if (isMouseDown && !pressedKeys.includes(note)) {
        handleKeyPress(note);
      } else if (!isMouseDown && pressedKeys.includes(note)) {
        handleKeyRelease(note);
      }
    },
    [isDisabled, isMouseDown, pressedKeys, handleKeyPress, handleKeyRelease]
  );

  const handleKeyLeave = useCallback(
    (note: string): void => {
      if (isDisabled || !isMouseDown) return;

      // Only release if this note is currently pressed
      if (pressedKeys.includes(note)) {
        handleKeyRelease(note);
      }
    },
    [isDisabled, isMouseDown, pressedKeys, handleKeyRelease]
  );

  // Cleanup function to release all pressed keys and reset state
  const cleanupStuckKeys = useCallback((): void => {
    if (isDisabled || !synth) return;

    // Release all currently pressed keys
    pressedKeys.forEach((note) => {
      synth.triggerRelease(note);
      onKeyUp(note);
    });

    // Reset pressed keys state
    setPressedKeys([]);
  }, [isDisabled, synth, pressedKeys, onKeyUp, setPressedKeys]);

  return {
    handleKeyPress,
    handleKeyRelease,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleKeyInteraction,
    handleKeyLeave,
    cleanupStuckKeys,
  };
}
