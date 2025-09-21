// Global types that are used across multiple components
// These should be truly shared types, not component-specific ones

// Re-export centralized oscillator types (used by urlUtils.ts and tests)
export * from "./oscillator";

// Re-export centralized note types
export * from "./note";

// Re-export centralized audio types (used by Minimoog hooks)
export * from "./audio";

// Re-export branded types (used across the application for type safety)
export * from "./branded";

// Re-export commonly used store types for convenience
export type { SynthState, SynthActions } from "@/store/types/synth";

// Re-export preset types
export type { Preset } from "@/data/presets";
