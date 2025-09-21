import { SimpleSynthObject } from "@/types/audio";

export type Minimoog = SimpleSynthObject;

export type KeyboardProps = {
  activeKeys?: string | null;
  octaveRange?: { min: number; max: number };
  extraKeys?: number;
  onKeyDown?: (note: string) => void;
  onKeyUp?: (note: string) => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  synth: Minimoog;
  view?: "desktop" | "tablet" | "mobile";
  onClick?: (e: React.MouseEvent) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
};

export type WhiteKeyProps = {
  isActive: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  note: string;
};

export type BlackKeyProps = WhiteKeyProps & {
  position: number;
  width: number;
};

export type KeyboardMap = {
  [key: string]: string;
};
