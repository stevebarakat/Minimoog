import { SynthState } from "@/store/types/synth";
import {
  createFrequencyRange,
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
} from "@/store/types/synth";

export type Preset = {
  id: string;
  name: string;
  description: string;
  category: string;
  controllers: {
    tune: number;
    glideTime: number;
    modMix: number;
    osc3FilterEgSwitch: boolean;
    noiseLfoSwitch: boolean;
    oscillatorModulationOn: boolean;
    osc3Control: boolean;
    keyboardControl1: boolean;
    keyboardControl2: boolean;
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
  effects?: {
    volume?: number;
    delay?: {
      enabled: boolean;
      mix?: number;
      time?: number;
      feedback?: number;
    };
    reverb?: {
      enabled: boolean;
      mix?: number;
      tone?: number;
    };
  };
  shareURL?: string;
};

export const presets: Preset[] = [
  // Starter preset - only show in development
  ...(process.env.NODE_ENV === "development"
    ? [
        {
          id: "starter-preset",
          name: "Starter Preset",
          description: "Starter preset for testing",
          category: "Starter",
          controllers: {
            tune: 0,
            glideTime: 1,
            modMix: 0,
            osc3FilterEgSwitch: false,
            noiseLfoSwitch: true,
            oscillatorModulationOn: false,
            osc3Control: true,
            keyboardControl1: false,
            keyboardControl2: false,
          },
          filter: {
            filterCutoff: 3.9,
            filterEmphasis: 0,
            filterContourAmount: 4.71,
            filterAttack: 0.3,
            filterDecay: 0,
            filterSustain: 4.5,
            filterModulationOn: true,
          },
          loudness: {
            loudnessAttack: 0,
            loudnessDecay: 0,
            loudnessSustain: 10,
          },
          oscillators: {
            oscillator1: {
              waveform: "sawtooth" as const,
              frequency: createFrequencyRange(0),
              range: "8" as const,
              enabled: true,
              volume: createVolumeRange(8),
            },
            oscillator2: {
              waveform: "sawtooth" as const,
              frequency: createFrequencyRange(0),
              range: "8" as const,
              enabled: false,
              volume: createVolumeRange(0),
            },
            oscillator3: {
              waveform: "triangle" as const,
              frequency: createFrequencyRange(0),
              range: "8" as const,
              enabled: false,
              volume: createVolumeRange(0),
            },
            mixer: {
              noise: {
                enabled: false,
                volume: createNoiseVolumeRange(0),
                noiseType: "white" as const,
              },
              external: {
                enabled: false,
                volume: createExternalInputVolumeRange(0),
              },
            },
          },
          sidePanel: {
            glideOn: true,
            decaySwitchOn: false,
            lfoRate: 3.5,
            lfoWaveform: "triangle" as const,
            modWheel: 50,
          },
          mainVolume: 5,
        },
      ]
    : []),
  {
    id: "solo-lead",
    name: "Solo Lead",
    description:
      "Expressive solo lead with sawtooth and triangle blend, perfect for melodic solos",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 1.5,
      modMix: 8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: true,
    },
    filter: {
      filterCutoff: 1.2,
      filterEmphasis: 7.5,
      filterContourAmount: 9.2,
      filterAttack: 2.5,
      filterDecay: 4.5,
      filterSustain: 7.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.5,
      loudnessDecay: 5.5,
      loudnessSustain: 8.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.2,
      lfoWaveform: "triangle",
      modWheel: 25,
    },
    mainVolume: 6.5,
    effects: {
      volume: 4,
      delay: {
        enabled: true,
        mix: 6,
        time: 3,
        feedback: 4,
      },
    },
  },

  {
    id: "warm-pad",
    name: "Warm Pad",
    description: "Rich, warm pad with pulse waves and gentle LFO modulation",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 6,
      modMix: 2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.8,
      filterEmphasis: 2.5,
      filterContourAmount: 5.5,
      filterAttack: 4.5,
      filterDecay: 8.5,
      filterSustain: 8.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 3.5,
      loudnessDecay: 8.5,
      loudnessSustain: 9.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "pulse1" as const,
        frequency: createFrequencyRange(0),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator2: {
        waveform: "pulse2" as const,
        frequency: createFrequencyRange(-7),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(-12),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.6,
      lfoWaveform: "triangle",
      modWheel: 20,
    },
    mainVolume: 5.5,
    effects: {
      volume: 5,
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 8,
        tone: 3,
      },
    },
  },

  {
    id: "atmospheric-pad",
    name: "Atmospheric Pad",
    description:
      "Evolving atmospheric pad with rich noise textures and wide stereo spread",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 6,
      modMix: 5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.5,
      filterEmphasis: 4,
      filterContourAmount: 6,
      filterAttack: 5,
      filterDecay: 9,
      filterSustain: 8,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 4,
      loudnessDecay: 8,
      loudnessSustain: 9,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator2: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(5),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator3: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(-5),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(2),
          noiseType: "pink" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.3,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 5,
    effects: {
      volume: 6,
      reverb: {
        enabled: true,
        mix: 9,
        tone: 6,
      },
      delay: {
        enabled: true,
        mix: 4,
        time: 5,
        feedback: 3,
      },
    },
  },
  {
    id: "space-mod",
    name: "Space Mod",
    description:
      "Space mod with sawtooth blend and expressive filter modulation",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 2.9,
      modMix: 0,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: false,
      keyboardControl1: false,
      keyboardControl2: true,
    },
    filter: {
      filterCutoff: -0.06,
      filterEmphasis: 7.5,
      filterContourAmount: 9.08,
      filterAttack: 3,
      filterDecay: 6,
      filterSustain: 0,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0,
      loudnessDecay: 4,
      loudnessSustain: 6.02,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(5.5),
      },
      oscillator3: {
        waveform: "pulse1",
        frequency: createFrequencyRange(1.38),
        range: "32",
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0.001),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.88,
      lfoWaveform: "square",
      modWheel: 78,
    },
    mainVolume: 5,
  },
  {
    id: "modern-lead",
    name: "Modern Lead",
    description:
      "Cutting modern lead with rich harmonics and dynamic filter modulation",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 1.2,
      modMix: 8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.5,
      filterEmphasis: 8.5,
      filterContourAmount: 9.8,
      filterAttack: 0.01,
      filterDecay: 1.2,
      filterSustain: 3,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 1.0,
      loudnessSustain: 5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1" as const,
        frequency: createFrequencyRange(0),
        range: "4" as const,
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(-7),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(1),
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 3.2,
      lfoWaveform: "triangle" as const,
      modWheel: 45,
    },
    mainVolume: 6,
    effects: {
      volume: 5,
      delay: {
        enabled: true,
        mix: 7,
        time: 1.5,
        feedback: 3,
      },
      reverb: {
        enabled: true,
        mix: 5,
        tone: 7,
      },
    },
  },
  {
    id: "crystal-pad",
    name: "Crystal Pad",
    description:
      "Bright, crystalline pad with ethereal shimmer and sparkling high frequencies",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 3.5, // Smoother transitions for pad
      modMix: 4.5, // More subtle modulation
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 4.5, // Slightly brighter
      filterEmphasis: 4.5, // Less harsh resonance
      filterContourAmount: 6.5, // More expressive filter movement
      filterAttack: 2.5, // Slower attack for pad character
      filterDecay: 6.5, // Longer decay
      filterSustain: 9.5, // Higher sustain
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 2.5, // Softer attack for pad
      loudnessDecay: 7.5, // Longer decay
      loudnessSustain: 9.0, // Higher sustain
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle" as const, // Softer for crystal-like tone
        frequency: createFrequencyRange(0),
        range: "4" as const,
        enabled: true,
        volume: createVolumeRange(8.5),
      },
      oscillator2: {
        waveform: "triangle" as const, // Triangle for purity
        frequency: createFrequencyRange(7),
        range: "2" as const, // Higher octave for sparkle
        enabled: true,
        volume: createVolumeRange(6.5),
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(12), // Perfect fifth for harmonic richness
        range: "2" as const, // Even higher for crystalline top
        enabled: true,
        volume: createVolumeRange(4.5),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(0.5), // Less noise for cleaner sound
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true, // Enable glide for smoother pad playing
      decaySwitchOn: false,
      lfoRate: 2.5, // Slower, more subtle LFO
      lfoWaveform: "triangle",
      modWheel: 35, // Less aggressive modulation
    },
    mainVolume: 5.5,
    effects: {
      volume: 6, // More prominent effects for atmosphere
      delay: {
        enabled: true,
        mix: 6, // Reduced mix for shimmer
        time: 1.2, // Slightly longer for more depth
        feedback: 2.5, // More feedback for sustain
      },
      reverb: {
        enabled: true,
        mix: 7, // Add spacious reverb
        tone: 6, // Bright reverb for sparkle
      },
    },
  },
  {
    id: "easy-lead",
    name: "Easy Lead",
    description: "Rich sawtooth lead with glide and expressive filter contour",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 1,
      modMix: 8.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.93,
      filterEmphasis: 5.56,
      filterContourAmount: 7.16,
      filterAttack: 3,
      filterDecay: 0.9,
      filterSustain: 2.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.9,
      loudnessSustain: 4.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "4",
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      oscillator3: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 7,
      lfoWaveform: "triangle",
      modWheel: 0,
    },
    mainVolume: 6.5,
    effects: {
      volume: 5,
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 6,
      },
    },
  },
  {
    id: "screaming-lead",
    name: "Screaming Lead",
    description:
      "Aggressive screaming lead with unison detuning and filter sweep",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 1,
      modMix: 8.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.2,
      filterEmphasis: 9,
      filterContourAmount: 9.8,
      filterAttack: 0.01,
      filterDecay: 0.9,
      filterSustain: 2.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.9,
      loudnessSustain: 4.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "4",
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      oscillator3: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 7,
      lfoWaveform: "triangle",
      modWheel: 85,
    },
    mainVolume: 6.5,
    effects: {
      volume: 6,
      delay: {
        enabled: true,
        mix: 5,
        time: 2,
        feedback: 3,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 6,
      },
    },
  },
  {
    id: "dream-pad",
    name: "Dream Pad",
    description:
      "Soft, dreamy pad with gentle pulse waves and floating modulation",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 7,
      modMix: 4,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: false,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.8,
      filterEmphasis: 2,
      filterContourAmount: 3,
      filterAttack: 6,
      filterDecay: 9,
      filterSustain: 9,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 5,
      loudnessDecay: 8,
      loudnessSustain: 9,
    },
    oscillators: {
      oscillator1: {
        waveform: "pulse1" as const,
        frequency: createFrequencyRange(0),
        range: "16" as const,
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator2: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(3),
        range: "16" as const,
        enabled: true,
        volume: createVolumeRange(4),
      },
      oscillator3: {
        waveform: "pulse2" as const,
        frequency: createFrequencyRange(-4),
        range: "16" as const,
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.2,
      lfoWaveform: "triangle",
      modWheel: 10,
    },
    mainVolume: 5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 8,
        tone: 4,
      },
    },
  },
  {
    id: "classic-minimoog-lead",
    name: "Classic Minimoog Lead",
    description:
      "Authentic Minimoog lead with sawtooth layers and classic filter contour",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.9,
      modMix: 0,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: true,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: true,
    },
    filter: {
      filterCutoff: 0.15,
      filterEmphasis: 8.04,
      filterContourAmount: 6.38,
      filterAttack: 1,
      filterDecay: 3,
      filterSustain: 4,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0,
      loudnessDecay: 0,
      loudnessSustain: 10,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      oscillator2: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "4",
        enabled: true,
        volume: createVolumeRange(5.5),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0.001),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 3.5,
      lfoWaveform: "triangle",
      modWheel: 0,
    },
    mainVolume: 5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 5,
      },
    },
  },
  {
    id: "taurus-bass",
    name: "Taurus Bass",
    description:
      "Deep, resonant Taurus pedal bass with sawtooth and pulse layers",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 0,
      modMix: 2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.8,
      filterEmphasis: 7.5,
      filterContourAmount: 8.5,
      filterAttack: 0.05,
      filterDecay: 4.5,
      filterSustain: 6.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.05,
      loudnessDecay: 4.0,
      loudnessSustain: 8.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0),
        range: "32" as const,
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1" as const,
        frequency: createFrequencyRange(0),
        range: "32" as const,
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(0),
        range: "32" as const,
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 2.5,
      lfoWaveform: "triangle",
      modWheel: 35,
    },
    mainVolume: 7.0,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 2,
      },
    },
  },

  {
    id: "analog-lead",
    name: "Analog Lead",
    description: "Warm analog lead with vintage character and rich modulation",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.8,
      modMix: 3,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.8,
      filterEmphasis: 6.8,
      filterContourAmount: 7.5,
      filterAttack: 0.15,
      filterDecay: 2.8,
      filterSustain: 6,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.15,
      loudnessDecay: 2.8,
      loudnessSustain: 7.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse2" as const,
        frequency: createFrequencyRange(0), // Unison with Osc1
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: createFrequencyRange(-12), // Sub octave
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(6.5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 5.08,
      lfoWaveform: "triangle",
      modWheel: 87,
    },
    mainVolume: 5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 5,
      },
    },
  },

  {
    id: "unison-lead",
    name: "Unison Lead",
    description:
      "Ultra-thick unison lead with micro-detuning for massive width",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2,
      modMix: 5.5,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.2,
      filterEmphasis: 5.5,
      filterContourAmount: 7.8,
      filterAttack: 0.12,
      filterDecay: 2.2,
      filterSustain: 6.8,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.12,
      loudnessDecay: 2.2,
      loudnessSustain: 8.2,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0),
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(0.5), // Micro detune for unison
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(9.8),
      },
      oscillator3: {
        waveform: "sawtooth" as const,
        frequency: createFrequencyRange(-0.3), // Counter micro detune
        range: "8" as const,
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white" as const,
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.8,
      lfoWaveform: "triangle",
      modWheel: 55,
    },
    mainVolume: 7,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 6,
      },
    },
  },

  {
    id: "thick-bass",
    name: "Thick Bass",
    description: "Thick, harmonically rich bass with sawtooth and pulse layers",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 1.64,
      modMix: 1.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.87,
      filterEmphasis: 2.56,
      filterContourAmount: 7.23,
      filterAttack: 0.01,
      filterDecay: 0.8,
      filterSustain: 3.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 1.2,
      loudnessSustain: 6,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.5,
      lfoWaveform: "triangle",
      modWheel: 20,
    },
    mainVolume: 6.5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 2,
        tone: 2,
      },
    },
  },
  {
    id: "funk-bass",
    name: "Funk Bass",
    description: "Punchy funk bass with tight attack and keyboard tracking",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 1.64,
      modMix: 1.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: true,
    },
    filter: {
      filterCutoff: -1.58,
      filterEmphasis: 7.68,
      filterContourAmount: 7.23,
      filterAttack: 0.01,
      filterDecay: 0.8,
      filterSustain: 3.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 1.2,
      loudnessSustain: 6,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.5,
      lfoWaveform: "triangle",
      modWheel: 20,
    },
    mainVolume: 6.5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: false,
      },
    },
  },

  {
    id: "easy-pad",
    name: "Easy Pad",
    description: "Warm pad with triangle waves and gentle modulation",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 4.5,
      modMix: 1.8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.2,
      filterEmphasis: 1.5,
      filterContourAmount: 3.8,
      filterAttack: 1.2,
      filterDecay: 4.2,
      filterSustain: 8.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 1.0,
      loudnessDecay: 4.5,
      loudnessSustain: 8.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "4",
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "2",
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 1.8,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 6.0,
    effects: {
      reverb: {
        enabled: true,
        mix: 7,
        tone: 5,
      },
    },
  },

  {
    id: "analog-bass",
    name: "Analog Bass",
    description: "Deep, warm analog bass with rich harmonics",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 1.5,
      modMix: 1.8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.8,
      filterEmphasis: 4.8,
      filterContourAmount: 6.2,
      filterAttack: 0.01,
      filterDecay: 0.7,
      filterSustain: 7.8,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.9,
      loudnessSustain: 8.2,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 2.2,
      lfoWaveform: "triangle",
      modWheel: 20,
    },
    mainVolume: 7.0,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: false,
      },
    },
  },
  {
    id: "vintage-lead",
    name: "Vintage Lead",
    description: "Classic vintage lead with warm, rounded character",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.2,
      modMix: 3.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.5,
      filterEmphasis: 2.2,
      filterContourAmount: 6.8,
      filterAttack: 0.05,
      filterDecay: 1.8,
      filterSustain: 6.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.05,
      loudnessDecay: 2.0,
      loudnessSustain: 6.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(9),
      },
      oscillator2: {
        waveform: "pulse2",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "8",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.8,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 6.8,
    effects: {
      reverb: {
        enabled: true,
        mix: 3,
        tone: 5,
      },
    },
  },

  {
    id: "percussive-bass",
    name: "Percussive Bass",
    description: "Tight, percussive bass with quick attack and decay",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 0.8,
      modMix: 1.2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.2,
      filterEmphasis: 5.2,
      filterContourAmount: 7.8,
      filterAttack: 0.01,
      filterDecay: 0.3,
      filterSustain: 2.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.4,
      loudnessSustain: 3.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 1.8,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 7.5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: false,
      },
    },
  },

  {
    id: "lucky-man",
    name: "Lucky Man",
    description: "Keith Emerson's iconic Minimoog lead from 'Lucky Man'",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.0,
      modMix: 4.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.2,
      filterEmphasis: 3.5,
      filterContourAmount: 7.8,
      filterAttack: 0.01,
      filterDecay: 1.8,
      filterSustain: 6.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 2.0,
      loudnessSustain: 7.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8.5),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 5.5,
      lfoWaveform: "triangle",
      modWheel: 0,
    },
    mainVolume: 7.5,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 6,
      },
    },
  },

  {
    id: "watery-lead",
    name: "Watery Lead",
    description:
      "Key tracked lead with sawtooth blend and expressive filter modulation",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.7,
      modMix: 0,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: true,
      oscillatorModulationOn: false,
      osc3Control: false,
      keyboardControl1: true,
      keyboardControl2: true,
    },
    filter: {
      filterCutoff: 1.27,
      filterEmphasis: 8.6,
      filterContourAmount: 6.59,
      filterAttack: 4,
      filterDecay: 3,
      filterSustain: 8,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0,
      loudnessDecay: 4,
      loudnessSustain: 10,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(9.5),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "2",
        enabled: true,
        volume: createVolumeRange(7.16),
      },
      oscillator3: {
        waveform: "rev_saw",
        frequency: createFrequencyRange(-1.79),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7.37),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 5.77,
      lfoWaveform: "triangle",
      modWheel: 45,
    },
    mainVolume: 6.5,
  },

  {
    id: "vintage-minimoog-pad",
    name: "Vintage Minimoog Pad",
    description: "Classic Minimoog pad sound from 70s progressive rock",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 4.8,
      modMix: 2.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.8,
      filterEmphasis: 2.2,
      filterContourAmount: 4.5,
      filterAttack: 2.2,
      filterDecay: 6.8,
      filterSustain: 8.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 1.8,
      loudnessDecay: 6.5,
      loudnessSustain: 9.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(-7),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "4",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 1.2,
      lfoWaveform: "triangle",
      modWheel: 18,
    },
    mainVolume: 6.0,
    effects: {
      reverb: {
        enabled: true,
        mix: 7,
        tone: 4,
      },
    },
  },

  {
    id: "authentic-minimoog-bass",
    name: "Authentic Minimoog Bass",
    description: "True Minimoog bass sound as heard on classic records",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 1.2,
      modMix: 2.2,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.2,
      filterEmphasis: 4.5,
      filterContourAmount: 6.8,
      filterAttack: 0.01,
      filterDecay: 0.9,
      filterSustain: 7.2,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 1.1,
      loudnessSustain: 7.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(4.5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 2.8,
      lfoWaveform: "triangle",
      modWheel: 22,
    },
    mainVolume: 7.2,
    effects: {
      delay: {
        enabled: false,
      },
      reverb: {
        enabled: false,
      },
    },
  },

  {
    id: "progressive-rock-lead",
    name: "Progressive Rock Lead",
    description:
      "Progressive rock lead with sawtooth blend and expressive filter modulation",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.2,
      modMix: 5.8,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.2,
      filterEmphasis: 5.2,
      filterContourAmount: 7.8,
      filterAttack: 0.02,
      filterDecay: 1.8,
      filterSustain: 6.0,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.02,
      loudnessDecay: 2.2,
      loudnessSustain: 6.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse2",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8.5),
      },
      oscillator3: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(-12),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6.5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 5.5,
      lfoWaveform: "triangle",
      modWheel: 40,
    },
    mainVolume: 7.0,
    effects: {
      reverb: {
        enabled: true,
        mix: 4,
        tone: 7,
      },
    },
  },
  {
    id: "space-echo",
    name: "Space Echo",
    description: "Classic tape echo lead with sawtooth blend and warm delay",
    category: "Lead",
    controllers: {
      tune: 0,
      glideTime: 2.5,
      modMix: 4.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.2,
      filterEmphasis: 4.8,
      filterContourAmount: 7.2,
      filterAttack: 0.02,
      filterDecay: 1.5,
      filterSustain: 6.5,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.02,
      loudnessDecay: 2.0,
      loudnessSustain: 7.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "8",
        enabled: true,
        volume: createVolumeRange(5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 4.2,
      lfoWaveform: "triangle",
      modWheel: 35,
    },
    mainVolume: 6.5,
    effects: {
      delay: {
        enabled: true,
        mix: 6,
        time: 5,
        feedback: 5,
      },
      reverb: {
        enabled: true,
        mix: 3,
        tone: 6,
      },
    },
  },
  {
    id: "cathedral-pad",
    name: "Cathedral Pad",
    description: "Massive cathedral-like pad with long reverb tail",
    category: "Pad",
    controllers: {
      tune: 0,
      glideTime: 3.5,
      modMix: 2.0,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.5,
      filterEmphasis: 1.5,
      filterContourAmount: 3.0,
      filterAttack: 4.0,
      filterDecay: 9.5,
      filterSustain: 9.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 3.0,
      loudnessDecay: 9.0,
      loudnessSustain: 9.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(-7),
        range: "4",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "2",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.5,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 5.5,
    effects: {
      reverb: {
        enabled: true,
        mix: 9,
        tone: 2,
      },
    },
  },
  {
    id: "dub-bass",
    name: "Dub Bass",
    description: "Deep dub bass with sawtooth layers and warm echo delay",
    category: "Bass",
    controllers: {
      tune: 0,
      glideTime: 0.5,
      modMix: 1.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.8,
      filterEmphasis: 5.5,
      filterContourAmount: 7.5,
      filterAttack: 0.01,
      filterDecay: 0.8,
      filterSustain: 7.0,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 1.0,
      loudnessSustain: 8.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "16",
        enabled: true,
        volume: createVolumeRange(5),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 2.5,
      lfoWaveform: "triangle",
      modWheel: 25,
    },
    mainVolume: 7.0,
    effects: {
      delay: {
        enabled: true,
        mix: 4,
        time: 5,
        feedback: 4,
      },
      reverb: {
        enabled: true,
        mix: 4,
        tone: 3,
      },
    },
  },

  {
    id: "alien-landscape",
    name: "Alien Landscape",
    description: "Otherworldly texture with slow-evolving modulation and noise",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 8.5,
      modMix: 3.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.8,
      filterEmphasis: 2.5,
      filterContourAmount: 4.2,
      filterAttack: 6.5,
      filterDecay: 9.5,
      filterSustain: 9.8,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 4.5,
      loudnessDecay: 9.0,
      loudnessSustain: 9.5,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(7),
        range: "4",
        enabled: true,
        volume: createVolumeRange(4),
      },
      oscillator3: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(-5),
        range: "2",
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(3),
          noiseType: "pink",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.3,
      lfoWaveform: "triangle",
      modWheel: 20,
    },
    mainVolume: 4.5,
    effects: {
      volume: 8,
      reverb: {
        enabled: true,
        mix: 9,
        tone: 2,
      },
      delay: {
        enabled: true,
        mix: 4,
        time: 6,
        feedback: 5,
      },
    },
  },

  {
    id: "glass-harmonica",
    name: "Glass Harmonica",
    description:
      "Ethereal glass harmonica with pure sine-like tones and long sustain",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 0.5,
      modMix: 1.0,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.8,
      filterEmphasis: 1.2,
      filterContourAmount: 2.8,
      filterAttack: 2.5,
      filterDecay: 8.5,
      filterSustain: 9.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 1.8,
      loudnessDecay: 8.8,
      loudnessSustain: 9.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(12),
        range: "4",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(12),
        range: "2",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.8,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 5.5,
    effects: {
      volume: 6,
      reverb: {
        enabled: true,
        mix: 8,
        tone: 3,
      },
    },
  },

  {
    id: "wind-chimes",
    name: "Wind Chimes",
    description:
      "Delicate wind chimes with random-like modulation and bright decay",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 0.2,
      modMix: 2.0,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 4.0,
      filterEmphasis: 6.8,
      filterContourAmount: 8.5,
      filterAttack: 0.01,
      filterDecay: 1.5,
      filterSustain: 0,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 2.0,
      loudnessSustain: 0,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(7),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(7),
        range: "4",
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(12),
        range: "2",
        enabled: true,
        volume: createVolumeRange(3),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(2),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 8.5,
      lfoWaveform: "square",
      modWheel: 60,
    },
    mainVolume: 5.0,
    effects: {
      volume: 4,
      delay: {
        enabled: true,
        mix: 6,
        time: 3,
        feedback: 4,
      },
    },
  },

  {
    id: "submarine-sonar",
    name: "Submarine Sonar",
    description: "Deep underwater sonar ping with long delay and reverb",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 0.1,
      modMix: 0,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 2.8,
      filterEmphasis: 7.5,
      filterContourAmount: 8.8,
      filterAttack: 0.01,
      filterDecay: 0.5,
      filterSustain: 0,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.8,
      loudnessSustain: 0,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 0,
      lfoWaveform: "triangle",
      modWheel: 0,
    },
    mainVolume: 6.0,
    effects: {
      volume: 7,
      delay: {
        enabled: true,
        mix: 5,
        time: 6,
        feedback: 6,
      },
      reverb: {
        enabled: true,
        mix: 8,
        tone: 2,
      },
    },
  },

  {
    id: "crystal-bells",
    name: "Crystal Bells",
    description: "Bright crystalline bells with shimmer and sparkle",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 0.3,
      modMix: 1.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: false,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 4.0,
      filterEmphasis: 7.2,
      filterContourAmount: 8.8,
      filterAttack: 0.01,
      filterDecay: 1.8,
      filterSustain: 0,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 2.2,
      loudnessSustain: 0,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(12),
        range: "4",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(12),
        range: "2",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 6.5,
      lfoWaveform: "triangle",
      modWheel: 45,
    },
    mainVolume: 5.5,
    effects: {
      volume: 5,
      delay: {
        enabled: true,
        mix: 7,
        time: 1.5,
        feedback: 3,
      },
      reverb: {
        enabled: true,
        mix: 6,
        tone: 7,
      },
    },
  },

  {
    id: "thunder-storm",
    name: "Thunder Storm",
    description: "Atmospheric thunder with noise and slow filter sweeps",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 6.0,
      modMix: 2.5,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.5,
      filterEmphasis: 3.8,
      filterContourAmount: 6.5,
      filterAttack: 4.5,
      filterDecay: 9.0,
      filterSustain: 8.5,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 3.5,
      loudnessDecay: 8.5,
      loudnessSustain: 8.8,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "32",
        enabled: true,
        volume: createVolumeRange(5),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "16",
        enabled: true,
        volume: createVolumeRange(3),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "8",
        enabled: true,
        volume: createVolumeRange(2),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(6),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.5,
      lfoWaveform: "triangle",
      modWheel: 25,
    },
    mainVolume: 4.5,
    effects: {
      volume: 8,
      reverb: {
        enabled: true,
        mix: 9,
        tone: 2,
      },
      delay: {
        enabled: true,
        mix: 5,
        time: 6,
        feedback: 6,
      },
    },
  },

  {
    id: "digital-rain",
    name: "Digital Rain",
    description: "Matrix-style digital rain with staccato pulses and reverb",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 0.1,
      modMix: 0,
      osc3FilterEgSwitch: false,
      noiseLfoSwitch: false,
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: true,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 3.5,
      filterEmphasis: 8.8,
      filterContourAmount: 9.5,
      filterAttack: 0.01,
      filterDecay: 0.2,
      filterSustain: 0,
      filterModulationOn: false,
    },
    loudness: {
      loudnessAttack: 0.01,
      loudnessDecay: 0.3,
      loudnessSustain: 0,
    },
    oscillators: {
      oscillator1: {
        waveform: "pulse1",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(10),
      },
      oscillator2: {
        waveform: "pulse2",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator3: {
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(6),
      },
      mixer: {
        noise: {
          enabled: false,
          volume: createNoiseVolumeRange(0),
          noiseType: "white",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 0,
      lfoWaveform: "triangle",
      modWheel: 0,
    },
    mainVolume: 6.0,
    effects: {
      volume: 6,
      delay: {
        enabled: true,
        mix: 6,
        time: 3,
        feedback: 4,
      },
      reverb: {
        enabled: true,
        mix: 7,
        tone: 8,
      },
    },
  },

  {
    id: "cosmic-drone",
    name: "Cosmic Drone",
    description:
      "Deep space drone with evolving harmonics and infinite sustain",
    category: "Experimental",
    controllers: {
      tune: 0,
      glideTime: 9.0,
      modMix: 4.0,
      osc3FilterEgSwitch: true,
      noiseLfoSwitch: true,
      oscillatorModulationOn: true,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    filter: {
      filterCutoff: 1.2,
      filterEmphasis: 2.0,
      filterContourAmount: 3.5,
      filterAttack: 8.0,
      filterDecay: 9.8,
      filterSustain: 10.0,
      filterModulationOn: true,
    },
    loudness: {
      loudnessAttack: 6.0,
      loudnessDecay: 9.5,
      loudnessSustain: 10.0,
    },
    oscillators: {
      oscillator1: {
        waveform: "triangle",
        frequency: createFrequencyRange(0),
        range: "8",
        enabled: true,
        volume: createVolumeRange(8),
      },
      oscillator2: {
        waveform: "triangle",
        frequency: createFrequencyRange(-7),
        range: "4",
        enabled: true,
        volume: createVolumeRange(6),
      },
      oscillator3: {
        waveform: "triangle",
        frequency: createFrequencyRange(-12),
        range: "2",
        enabled: true,
        volume: createVolumeRange(4),
      },
      mixer: {
        noise: {
          enabled: true,
          volume: createNoiseVolumeRange(2),
          noiseType: "pink",
        },
        external: {
          enabled: false,
          volume: createExternalInputVolumeRange(0),
        },
      },
    },
    sidePanel: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 0.2,
      lfoWaveform: "triangle",
      modWheel: 15,
    },
    mainVolume: 4.0,
    effects: {
      volume: 8,
      reverb: {
        enabled: true,
        mix: 9,
        tone: 2,
      },
      delay: {
        enabled: true,
        mix: 6,
        time: 9,
        feedback: 7,
      },
    },
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
