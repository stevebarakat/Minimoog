// Component Prop Types for existing components

import type { ReactNode } from "react";

// Knob Component Types
export type KnobSize = "small" | "medium" | "large";
export type KnobType = "radial" | "linear";

export type KnobProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  title?: string | ReactNode | null;
  unit?: string;
  onChange: (value: number) => void;
  valueLabels?: Record<number, string | ReactNode>;
  size?: KnobSize;
  showMidTicks?: boolean;
  type?: KnobType;
  logarithmic?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
};

// Keyboard Component Types
export type KeyboardView = "desktop" | "tablet" | "mobile";

export type KeyboardProps = {
  activeKeys?: string | null;
  octaveRange?: { min: number; max: number };
  onKeyDown?: (note: string) => void;
  onKeyUp?: (note: string) => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  synth: unknown; // Minimoog type
  view?: KeyboardView;
};

export type WhiteKeyProps = {
  isActive: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  note: string;
};

export type BlackKeyProps = {
  isActive: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  note: string;
  position: number;
};

// Rocker Switch Types
export type RockerSwitchTheme = "black" | "orange" | "blue" | "white";
export type RockerSwitchOrientation = "horizontal" | "vertical";

export type RockerSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  topLabelLeft?: string | ReactNode;
  topLabel?: string | ReactNode;
  topLabelRight?: string | ReactNode;
  leftLabel?: string | ReactNode;
  bottomLabelLeft?: string | ReactNode;
  bottomLabel?: string | ReactNode;
  bottomLabelRight?: string | ReactNode;
  theme?: RockerSwitchTheme;
  style?: React.CSSProperties;
  orientation?: RockerSwitchOrientation;
  disabled?: boolean;
  testid?: string;
};

// Vintage LED Types
export type LEDSize = "small" | "medium" | "large";
export type LEDColor = "red" | "yellow";

export type VintageLEDProps = {
  isOn?: boolean;
  warmupEffect?: boolean;
  className?: string;
  label?: string;
  size?: LEDSize;
  color?: LEDColor;
  onCheckedChange: (e: React.FormEvent<HTMLInputElement>) => void;
};

// Wheel Component Types
export type WheelProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onMouseUp?: () => void;
  label?: string;
  isDisabled?: boolean;
};

// Screw Component Types
export type ScrewSize = "small" | "medium" | "large";
export type ScrewColor = "light" | "dark";

export type ScrewProps = {
  size?: ScrewSize;
  className?: string;
  color?: ScrewColor;
  hidden?: boolean;
};

// Title Component Types
export type TitleSize = "sm" | "md" | "lg" | "xl";

export type TitleProps = {
  children: ReactNode;
  size?: TitleSize;
  style?: React.CSSProperties;
};

// Power Button Types
export type PowerButtonProps = {
  isOn: boolean;
  onPowerOn: () => void;
  onPowerOff: () => void;
};

// Mixer Component Types
export type MixerProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

// Noise Component Types
export type NoiseProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

// External Input Types
export type ExternalInputProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

// Overload Indicator Types
export type OverloadIndicatorSize = "small" | "medium" | "large";

export type OverloadIndicatorProps = {
  isEnabled: boolean;
  volume: number;
  audioLevel: number;
  label?: string;
  style?: React.CSSProperties;
  size?: OverloadIndicatorSize;
};

// Oscillator Panel Types
export type OscillatorPanelProps = {
  showControlSwitch?: boolean;
  controlSwitchProps?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    theme?: RockerSwitchTheme;
  };
  children: ReactNode;
  style?: React.CSSProperties;
  isDisabled?: boolean;
};

// Preset List Types
export type PresetListProps = {
  presets: unknown[]; // Preset type
  currentPreset: string | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  onSelect: (preset: unknown) => void;
};

// Category Filter Types
export type CategoryFilterProps = {
  selectedCategory: string;
  categories?: string[];
  onChange: (category: string) => void;
};

// Error Boundary Types
export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

// GitHub Ribbon Types
export type GitHubRibbonProps = {
  url: string;
  text: string;
};

// Layout Component Types
export type ContainerProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type RowProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gap?: number;
};

export type ColumnProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gap?: number;
};

export type SectionProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
};

export type SpacerProps = {
  size?: number;
  axis?: "horizontal" | "vertical";
  className?: string;
};

export type LineProps = {
  className?: string;
  style?: React.CSSProperties;
  orientation?: "horizontal" | "vertical";
};

// Side Panel Types
export type SidePanelProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

// Panel Types
export type PanelProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  background?: string;
};

// Hinge Types
export type HingeProps = {
  className?: string;
  style?: React.CSSProperties;
};

// Side Types
export type SideProps = {
  className?: string;
  style?: React.CSSProperties;
  side?: "left" | "right";
};

// Logo Types
export type LogoProps = {
  className?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium" | "large";
};

// Tune Component Types
export type TuneProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// Glide Component Types
export type GlideProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// Pitch Bender Types
export type PitchBenderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// Modulation Wheel Types
export type ModulationWheelProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// LFO Rate Types
export type LfoRateProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// LFO Waveform Switch Types
export type LfoWaveformSwitchProps = {
  value: "triangle" | "square";
  onChange: (value: "triangle" | "square") => void;
  disabled?: boolean;
};

// Modulation Mix Types
export type ModulationMixProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// Decay Switch Types
export type DecaySwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

// Glide Switch Types
export type GlideSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

// Filter Component Types
export type FilterProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
  disabled?: boolean;
};

// Envelope Component Types
export type EnvelopeProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
  loudnessEnvelopeGain: GainNode | null;
  osc1: unknown | null; // Oscillator type
  osc2: unknown | null; // Oscillator type
  osc3: unknown | null; // Oscillator type
  disabled?: boolean;
};

// Output Component Types
export type OutputProps = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  disabled?: boolean;
};

// Aux Output Types
export type AuxOutProps = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  disabled?: boolean;
};

// Main Output Types
export type MainOutputProps = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  disabled?: boolean;
};

// Controllers Types
export type ControllersProps = {
  disabled?: boolean;
};

// Controls Types
export type ControlsProps = {
  disabled?: boolean;
};

// Modifiers Types
export type ModifiersProps = {
  disabled?: boolean;
};

// Minimoog Types
export type MinimoogProps = {
  disabled?: boolean;
};

// Audio Node Types (for component props)
export type AudioNodes = {
  mixerNode: GainNode | null;
  filterNode: AudioWorkletNode | null;
  loudnessEnvelopeGain: GainNode | null;
  masterGain: GainNode | null;
  isMixerReady: boolean;
};
