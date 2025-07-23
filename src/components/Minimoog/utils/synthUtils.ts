// Parameter mapping utilities have been moved to '@/utils/paramMappingUtils'.
// Only oscillator type mapping remains here.

// Helper to map internal waveform names to Web Audio API types
export function mapOscillatorType(waveform: string): OscillatorType {
  switch (waveform) {
    case "triangle":
      return "triangle";
    case "sawtooth":
      return "sawtooth";
    case "pulse1":
    case "pulse2":
    case "pulse3":
      return "square";
    default:
      return "sine"; // fallback for custom or unsupported types
  }
}
