import { useCallback } from "react";
import type { UseKeyboardHandlersProps } from "./types";

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

      // Always trigger the new note - the synth should handle the transition
      synth.triggerAttack(note);
      onKeyDown(note);
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
          // There are still other keys pressed - switch to the last pressed key
          const nextKey = stillPressedKeys[stillPressedKeys.length - 1];

          // Properly release the current note before triggering the next one
          // This prevents decay cutoff issues and ensures clean note transitions
          synth.triggerRelease(note);

          // Small delay to allow the release to process before triggering the next note
          // This mimics the robust note sequencing logic used in MIDI handling
          setTimeout(() => {
            synth.triggerAttack(nextKey);
            onKeyDown(nextKey);
          }, 10);
        } else {
          // No more keys pressed - release the note
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
      if (isMouseDown && !pressedKeys.includes(note)) {
        handleKeyPress(note);
      } else if (!isMouseDown && pressedKeys.includes(note)) {
        handleKeyRelease(note);
      }
    },
    [isMouseDown, pressedKeys, handleKeyPress, handleKeyRelease]
  );

  const handleKeyLeave = useCallback(
    (note: string): void => {
      if (isMouseDown && pressedKeys.includes(note)) {
        handleKeyRelease(note);
      }
    },
    [isMouseDown, pressedKeys, handleKeyRelease]
  );

  return {
    handleKeyPress,
    handleKeyRelease,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleKeyInteraction,
    handleKeyLeave,
  };
}
