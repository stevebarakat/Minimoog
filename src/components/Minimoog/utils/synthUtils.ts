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
      return "sine";
  }
}
