export type UseKeyboardHandlersProps = {
  isMouseDown: boolean;
  setIsMouseDown: (down: boolean) => void;
  pressedKeys: string[];
  setPressedKeys: (keys: string[] | ((prev: string[]) => string[])) => void;
  synth: {
    triggerAttack: (note: string) => void;
    triggerRelease: (note: string) => void;
  };
  activeKeys: string | null;
  onKeyDown: (note: string) => void;
  onKeyUp: (note: string) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  isDisabled: boolean;
};

export type UseKeyboardHandlersReturn = {
  handleKeyPress: (note: string) => void;
  handleKeyRelease: (note: string) => void;
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleKeyInteraction: (note: string) => void;
  handleKeyLeave: (note: string) => void;
  cleanupStuckKeys: () => void;
};
