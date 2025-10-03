import type { OnboardingStep } from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Minimoog!",
    description:
      "This is a faithful recreation of the legendary Minimoog Model D synthesizer. Let's take a quick tour to get you started.",
    position: "bottom",
  },
  {
    id: "oscillators",
    title: "Oscillators",
    description:
      "These three oscillators are the heart of the Minimoog. Each can produce different waveforms and frequencies to create rich, complex sounds.",
    target: "[data-onboarding='oscillators']",
    position: "bottom",
  },
  {
    id: "mixer",
    title: "Mixer",
    description:
      "The mixer controls the volume of each oscillator. It also controls the volume of the noise generator and external input. Blend the 5 sources to create your desired sound.",
    target: "[data-onboarding='mixer']",
    position: "bottom",
  },
  {
    id: "filter",
    title: "Filter",
    description:
      "The legendary Moog filter shapes the synth's tone. Cutoff controls the brightness, while emphasis adds resonance.",
    target: "[data-onboarding='filter']",
    position: "bottom",
  },
  {
    id: "filter-envelope",
    title: "Filter Envelope",
    description:
      "Shape your filter over time. The Filter Envelope controls how the filter cutoff changes when you press a key. Adjust Attack, Decay, Sustain, and Release to create dynamic filter sweeps.",
    target: "[data-onboarding='filter-envelope']",
    position: "bottom",
  },
  {
    id: "loudness-envelope",
    title: "Loudness Envelope",
    description:
      "Control the volume shape of your sound. The Loudness Envelope determines how the overall volume changes over time. Use this to create percussive or sustained sounds.",
    target: "[data-onboarding='loudness-envelope']",
    position: "bottom",
  },
  {
    id: "controllers",
    title: "Controllers",
    description:
      "Fine-tune your sound with the controllers. Tune adjusts the overall pitch, Glide creates smooth transitions between notes, and Modulation Mix controls the intensity of modulation effects.",
    target: "[data-onboarding='controllers']",
    position: "bottom",
  },
  {
    id: "modulation",
    title: "Modulation",
    description:
      "The modulation section adds movement to your sound. Use the LFO and modulation wheel to create dynamic, evolving patches.",
    target: "[data-onboarding='modulation']",
    position: "bottom",
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description:
      "Hook up a MIDI keyboard or use the computer's keyboard to play the Minimoog. Use the pitch and modulation wheels for expressive control.",
    target: "[data-onboarding='keyboard']",
    position: "top",
  },
  {
    id: "options",
    title: "Options",
    description:
      "This is were you can disable this tour, enable learning mode, and enable magnified knobs.",
    target: "[data-onboarding='options']",
    position: "bottom",
  },
  {
    id: "presets",
    title: "Presets",
    description:
      "Load classic Minimoog presets to get you started. Choose from a variety of iconic sounds that showcase the synthesizer's capabilities.",
    target: "[data-onboarding='presets']",
    position: "bottom",
  },
  {
    id: "effects",
    title: "Effects",
    description:
      "Add depth to your sound with built-in effects! Access delay and reverb effects that can be opened as floating panels. Each effect has individual controls and can be used together.",
    target: "[data-onboarding='effects']",
    position: "bottom",
  },
  {
    id: "copy-settings",
    title: "Copy Settings",
    description:
      "Share your patches with others or bookmark them for later! Click 'Save Settings' to copy a generated URL with your current settings to your clipboard. Anyone with the link can load your exact patch.",
    target: "[data-onboarding='copy-settings']",
    position: "bottom",
  },
  {
    id: "power",
    title: "You're Ready!",
    description:
      "You now know the basics of the Minimoog. Start exploring and creating your own unique sounds!",
    position: "top",
  },
];
