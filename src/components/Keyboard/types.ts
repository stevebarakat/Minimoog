import { SynthObject } from "@/store/types/synth";

export type Note = {
  note: string;
  isSharp: boolean;
};

export type Minimoog = SynthObject;

export type KeyboardProps = {
  activeKeys?: string | null;
  octaveRange?: { min: number; max: number };
  onKeyDown?: (note: string) => void;
  onKeyUp?: (note: string) => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  synth: Minimoog;
  view?: "desktop" | "tablet" | "mobile";
};

export type WhiteKeyProps = {
  isActive: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

export type BlackKeyProps = WhiteKeyProps & {
  position: number;
  width: number;
};

export type KeyboardMap = {
  [key: string]: string;
};
