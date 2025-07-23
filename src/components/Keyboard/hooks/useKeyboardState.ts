import { useState } from "react";

export function useKeyboardState() {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [octaveOffset, setOctaveOffset] = useState(0);

  return {
    isMouseDown,
    setIsMouseDown,
    isReleasing,
    setIsReleasing,
    pressedKeys,
    setPressedKeys,
    octaveOffset,
    setOctaveOffset,
  };
}
