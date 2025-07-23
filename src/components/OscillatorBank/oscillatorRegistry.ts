import { createOscillator1 } from "./audio/oscillator1";
import { createOscillator2 } from "./audio/oscillator2";
import { createOscillator3 } from "./audio/oscillator3";
import type { OscillatorInstance } from "./hooks/useOscillatorFactory";
import { TriangleIcon, SawtoothIcon, SquareIcon } from "./icons/WaveformIcons";

export type OscillatorCreateConfig = {
  audioContext: AudioContext;
  waveform: string;
  frequency: number;
  range: string;
};

export type OscillatorFactory = (
  config: OscillatorCreateConfig,
  mixerNode?: AudioNode
) => OscillatorInstance;

export type OscillatorRegistryEntry = {
  label: string;
  factory: OscillatorFactory;
  icon?: React.ComponentType;
};

const oscillatorRegistry: Record<string, OscillatorRegistryEntry> = {};

export function registerOscillator(
  type: string,
  entry: OscillatorRegistryEntry
) {
  oscillatorRegistry[type] = entry;
}

export function getOscillatorFactory(
  type: string
): OscillatorFactory | undefined {
  return oscillatorRegistry[type]?.factory;
}

export function getOscillatorTypes(): string[] {
  return Object.keys(oscillatorRegistry);
}

export function getOscillatorRegistry(): Record<
  string,
  OscillatorRegistryEntry
> {
  return oscillatorRegistry;
}

// Adapter wrappers to fix type compatibility
const triangleFactory: OscillatorFactory = (config, mixerNode) =>
  createOscillator1(
    {
      ...config,
      range: config.range as "32" | "16" | "8" | "4" | "2" | "lo",
      waveform: config.waveform as
        | "triangle"
        | "tri_saw"
        | "sawtooth"
        | "pulse1"
        | "pulse2"
        | "pulse3",
    },
    mixerNode
  );

const sawtoothFactory: OscillatorFactory = (config, mixerNode) =>
  createOscillator2(
    {
      ...config,
      range: config.range as "32" | "16" | "8" | "4" | "2" | "lo",
      waveform: config.waveform as
        | "triangle"
        | "tri_saw"
        | "sawtooth"
        | "pulse1"
        | "pulse2"
        | "pulse3",
    },
    mixerNode
  );

const squareFactory: OscillatorFactory = (config, mixerNode) =>
  createOscillator3(
    {
      ...config,
      range: config.range as "32" | "16" | "8" | "4" | "2" | "lo",
      waveform: config.waveform as
        | "triangle"
        | "rev_saw"
        | "sawtooth"
        | "pulse1"
        | "pulse2"
        | "pulse3",
    },
    mixerNode
  );

// Register built-in oscillators with icons
registerOscillator("triangle", {
  label: "Triangle",
  factory: triangleFactory,
  icon: TriangleIcon,
});
registerOscillator("sawtooth", {
  label: "Sawtooth",
  factory: sawtoothFactory,
  icon: SawtoothIcon,
});
registerOscillator("square", {
  label: "Square",
  factory: squareFactory,
  icon: SquareIcon,
});
// Example: register more types as needed
// registerOscillator("tri_saw", { label: "Tri-Saw", factory: triangleFactory, icon: TriSawIcon });
// registerOscillator("pulse1", { label: "Wide Pulse", factory: triangleFactory, icon: WidePulseIcon });
// registerOscillator("pulse2", { label: "Narrow Pulse", factory: triangleFactory, icon: NarrowPulseIcon });
// registerOscillator("rev_saw", { label: "Reverse Saw", factory: triangleFactory, icon: ReverseSawIcon });
