import { SynthState } from "@/store/types/synth";

export type Preset = {
  id: string;
  name: string;
  description: string;
  category: string;
  controllers: {
    tune: number; // 0-10
    glideTime: number; // 0-10
    modMix: number; // 0-10
    osc3FilterEgSwitch: boolean;
    noiseLfoSwitch: boolean;
  };
  filter: {
    filterCutoff: number;
    filterEmphasis: number;
    filterContourAmount: number;
    filterAttack: number;
    filterDecay: number;
    filterSustain: number;
    filterModulationOn: boolean;
  };
  loudness: {
    loudnessAttack: number;
    loudnessDecay: number;
    loudnessSustain: number;
  };
  oscillators: Partial<SynthState>;
  sidePanel: {
    glideOn: boolean;
    decaySwitchOn: boolean;
    lfoRate: number;
    lfoWaveform: "triangle" | "square";
    modWheel: number;
  };
  mainVolume: number;
  shareURL?: string; // Optional URL for sharing
};

export const presets: Preset[] = [
  {
    id: "fat-bass",
    name: "Fat Bass",
    description:
      "Classic Minimoog bass sound with rich harmonics and punchy attack",
    category: "Bass",
    controllers: {
      tune: 5,
      glideTime: 0,
      modMix: 2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 3,
      filterEmphasis: 7,
      filterContourAmount: 8,
      filterAttack: 0.1,
      filterDecay: 4,
      filterSustain: 3,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.1,
      loudnessDecay: 3,
      loudnessSustain: 6,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: 0,
        range: "32",
        enabled: true,
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 10 },
        osc2: { enabled: true, volume: 8 },
        osc3: { enabled: true, volume: 6 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 5,
      lfoWaveform: "triangle",
      modWheel: 50,
    },
    mainVolume: 5,
  },
  {
    id: "lead-solo",
    name: "Lead Solo",
    description:
      "Screaming lead sound perfect for solos with filter modulation",
    category: "Lead",
    controllers: {
      tune: 5,
      glideTime: 3,
      modMix: 8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 2,
      filterEmphasis: 8,
      filterContourAmount: 7,
      filterAttack: 0.5,
      filterDecay: 2,
      filterSustain: 4,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.2,
      loudnessDecay: 2,
      loudnessSustain: 7,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: 0,
        range: "8",
        enabled: true,
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: 7,
        range: "8",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: -7,
        range: "8",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 10 },
        osc2: { enabled: true, volume: 7 },
        osc3: { enabled: true, volume: 4 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 6,
      lfoWaveform: "triangle",
      modWheel: 70,
    },
    mainVolume: 5,
  },
  {
    id: "warm-pad",
    name: "Warm Pad",
    description: "Smooth, warm pad sound with slow filter movement",
    category: "Pad",
    controllers: {
      tune: 5,
      glideTime: 1,
      modMix: 4,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 4,
      filterEmphasis: 6,
      filterContourAmount: 5,
      filterAttack: 2,
      filterDecay: 6,
      filterSustain: 8,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 1,
      loudnessDecay: 5,
      loudnessSustain: 9,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: 0,
        range: "8",
        enabled: true,
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: 1,
        range: "8",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: -7,
        range: "8",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 8 },
        osc2: { enabled: true, volume: 6 },
        osc3: { enabled: true, volume: 4 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 2,
      lfoWaveform: "triangle",
      modWheel: 40,
    },
    mainVolume: 5,
  },
  {
    id: "noise-bass",
    name: "Noise Bass",
    description: "Aggressive bass with noise for industrial/electronic music",
    category: "Bass",
    controllers: {
      tune: 5,
      glideTime: 0,
      modMix: 1,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
    },
    filter: {
      filterCutoff: 2,
      filterEmphasis: 9,
      filterContourAmount: 6,
      filterAttack: 0.1,
      filterDecay: 3,
      filterSustain: 2,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.1,
      loudnessDecay: 2,
      loudnessSustain: 5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: -7,
        range: "16",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: -7,
        range: "16",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 8 },
        osc2: { enabled: true, volume: 6 },
        osc3: { enabled: true, volume: 4 },
        noise: { enabled: true, volume: 3, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 4,
      lfoWaveform: "square",
      modWheel: 30,
    },
    mainVolume: 5,
  },
  {
    id: "brass-lead",
    name: "Brass Lead",
    description: "Brassy lead sound with pulse waves and filter modulation",
    category: "Lead",
    controllers: {
      tune: 5,
      glideTime: 2,
      modMix: 6,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 4,
      filterEmphasis: 7,
      filterContourAmount: 6,
      filterAttack: 0.3,
      filterDecay: 3,
      filterSustain: 5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.3,
      loudnessDecay: 3,
      loudnessSustain: 6,
    },
    oscillators: {
      oscillator1: {
        waveform: "pulse1",
        frequency: 0,
        range: "8",
        enabled: true,
      },
      oscillator2: {
        waveform: "pulse2",
        frequency: 7,
        range: "8",
        enabled: true,
      },
      oscillator3: {
        waveform: "sawtooth",
        frequency: -7,
        range: "8",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 9 },
        osc2: { enabled: true, volume: 7 },
        osc3: { enabled: true, volume: 5 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 5,
      lfoWaveform: "triangle",
      modWheel: 60,
    },
    mainVolume: 5,
  },
  {
    id: "string-pad",
    name: "String Pad",
    description: "Ethereal string-like pad with detuned oscillators",
    category: "Pad",
    controllers: {
      tune: 5,
      glideTime: 2,
      modMix: 3,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 3,
      filterEmphasis: 5,
      filterContourAmount: 4,
      filterAttack: 3,
      filterDecay: 7,
      filterSustain: 9,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 2,
      loudnessDecay: 6,
      loudnessSustain: 9,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: 0,
        range: "8",
        enabled: true,
      },
      oscillator2: {
        waveform: "triangle",
        frequency: 1,
        range: "8",
        enabled: true,
      },
      oscillator3: {
        waveform: "sawtooth",
        frequency: -7,
        range: "8",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 7 },
        osc2: { enabled: true, volume: 7 },
        osc3: { enabled: true, volume: 5 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 1,
      lfoWaveform: "triangle",
      modWheel: 35,
    },
    mainVolume: 5,
  },
  {
    id: "acid-bass",
    name: "Acid Bass",
    description: "Resonant acid bass with high emphasis and modulation",
    category: "Bass",
    controllers: {
      tune: 5,
      glideTime: 0,
      modMix: 9,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 4,
      filterEmphasis: 10,
      filterContourAmount: 8,
      filterAttack: 0.1,
      filterDecay: 5,
      filterSustain: 2,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.1,
      loudnessDecay: 4,
      loudnessSustain: 4,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: -7,
        range: "32",
        enabled: true,
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: -7,
        range: "16",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: -7,
        range: "16",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 10 },
        osc2: { enabled: true, volume: 8 },
        osc3: { enabled: true, volume: 6 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 8,
      lfoWaveform: "square",
      modWheel: 80,
    },
    mainVolume: 5,
  },
  {
    id: "bell-lead",
    name: "Bell Lead",
    description: "Bright bell-like lead with high frequencies and quick decay",
    category: "Lead",
    controllers: {
      tune: 5,
      glideTime: 1,
      modMix: 2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
    },
    filter: {
      filterCutoff: 4,
      filterEmphasis: 8,
      filterContourAmount: 3,
      filterAttack: 0.1,
      filterDecay: 1,
      filterSustain: 2,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.1,
      loudnessDecay: 1,
      loudnessSustain: 3,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: 440,
        range: "8",
        enabled: true,
      },
      oscillator2: {
        waveform: "triangle",
        frequency: 880,
        range: "8",
        enabled: true,
      },
      oscillator3: {
        waveform: "triangle",
        frequency: 1320,
        range: "8",
        enabled: true,
      },
      mixer: {
        osc1: { enabled: true, volume: 8 },
        osc2: { enabled: true, volume: 6 },
        osc3: { enabled: true, volume: 4 },
        noise: { enabled: false, volume: 0, noiseType: "white" },
        external: { enabled: false, volume: 0, overload: false },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 3,
      lfoWaveform: "triangle",
      modWheel: 45,
    },
    mainVolume: 5,
  },
];

export const getPresetById = (id: string): Preset | undefined => {
  return presets.find((preset) => preset.id === id);
};

export const getPresetsByCategory = (category: string): Preset[] => {
  return presets.filter((preset) => preset.category === category);
};

export const getCategories = (): string[] => {
  return [...new Set(presets.map((preset) => preset.category))];
};
