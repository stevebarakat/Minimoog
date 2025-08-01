import { useCallback } from "react";
import type { UseKeyboardHandlersProps } from "./types";

export function useKeyboardHandlers({
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
}: UseKeyboardHandlersProps) {
  const handleKeyPress = useCallback(
    (note: string): void => {
      if (isReleasing || isDisabled || !synth) return;
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
    [isReleasing, isDisabled, synth, onKeyDown, activeKeys, setPressedKeys]
  );

  const handleKeyRelease = useCallback(
    (note: string): void => {
      if (isReleasing || isDisabled || !synth) return;
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
      setPressedKeys,
      setIsReleasing,
    ]
  );

  const handleMouseDown = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    setIsMouseDown(true);
    onMouseDown();
  }, [onMouseDown, isReleasing, isDisabled, setIsMouseDown]);

  const handleMouseUp = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    setIsMouseDown(false);
    onMouseUp();
  }, [onMouseUp, isReleasing, isDisabled, setIsMouseDown]);

  const handleMouseLeave = useCallback((): void => {
    if (isReleasing || isDisabled) return;
    setIsMouseDown(false);
  }, [isReleasing, isDisabled, setIsMouseDown]);

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
