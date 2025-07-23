import { useCallback, useEffect, useRef } from "react";
import { getNoteFromKeyEvent, FIXED_OCTAVE } from "../utils";

export function useKeyboardHandlers({
  isMouseDown,
  setIsMouseDown,
  isReleasing,
  setIsReleasing,
  pressedKeys,
  setPressedKeys,
  octaveOffset,
  setOctaveOffset,
  synth,
  activeKeys,
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onMouseUp,
  isDisabled,
}) {
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
    [isReleasing, isDisabled, synth, onKeyDown, activeKeys, setPressedKeys]
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
    setIsMouseDown,
    setIsReleasing,
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
    setIsMouseDown,
    setIsReleasing,
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

  // Handle octave changes
  const handleOctaveChange = useCallback(
    (direction: "up" | "down") => {
      if (isDisabled) return;
      setOctaveOffset((prev) => {
        const newOffset = direction === "up" ? prev + 1 : prev - 1;
        return Math.max(-2, Math.min(2, newOffset));
      });
    },
    [isDisabled, setOctaveOffset]
  );

  // Keyboard event handlers for the container
  const handleContainerKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.key || isDisabled) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        handleOctaveChange("up");
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleOctaveChange("down");
        return;
      }
      const note = getNoteFromKeyEvent(e.key, FIXED_OCTAVE + octaveOffset);
      if (note && !e.repeat) {
        handleKeyPress(note);
      }
    },
    [handleKeyPress, handleOctaveChange, isDisabled, octaveOffset]
  );

  const handleContainerKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!e.key || isDisabled) return;
      if (e.key === "=" || e.key === "+" || e.key === "-" || e.key === "_") {
        return;
      }
      const note = getNoteFromKeyEvent(e.key, FIXED_OCTAVE + octaveOffset);
      if (note) {
        handleKeyRelease(note);
      }
    },
    [handleKeyRelease, isDisabled, octaveOffset]
  );

  // Add global keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleContainerKeyDown);
    window.addEventListener("keyup", handleContainerKeyUp);
    return () => {
      window.removeEventListener("keydown", handleContainerKeyDown);
      window.removeEventListener("keyup", handleContainerKeyUp);
    };
  }, [handleContainerKeyDown, handleContainerKeyUp]);

  return {
    handleKeyPress,
    handleKeyRelease,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleKeyInteraction,
    handleKeyLeave,
    handleOctaveChange,
    handleContainerKeyDown,
    handleContainerKeyUp,
  };
}
