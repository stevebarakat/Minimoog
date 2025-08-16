import { useState } from "react";

export function useKeyboardState() {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  return {
    isMouseDown,
    setIsMouseDown,
    isReleasing,
    setIsReleasing,
    pressedKeys,
    setPressedKeys,
  };
}
