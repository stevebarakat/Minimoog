// Mapping utility for attack/decay envelope knobs with non-linear scaling
// Values and positions are based on classic Minimoog envelope timing
// Values are in milliseconds and need to be converted to 0-10 range for mapEnvelopeTime

export const attackDecayStops = [
  { pos: 0, value: 0 }, // 0 ms
  { pos: 1000, value: 10 }, // 10 ms
  { pos: 2000, value: 200 }, // 200 ms
  { pos: 4000, value: 600 }, // 600 ms
  { pos: 6000, value: 1000 }, // 1000 ms (1 sec)
  { pos: 8000, value: 5000 }, // 5000 ms (5 sec)
  { pos: 10000, value: 10000 }, // 10000 ms (10 sec)
];

// Convert milliseconds to 0-10 range for mapEnvelopeTime
function msToEnvelopeRange(ms: number): number {
  // Map milliseconds to 0-10 range logarithmically
  // 0ms = 0, 10ms = 1, 200ms = 3, 600ms = 5, 1000ms = 6, 5000ms = 8, 10000ms = 10
  if (ms <= 0) return 0;
  if (ms >= 10000) return 10;

  // Use a logarithmic mapping that gives better control
  const stops = [
    { ms: 0, range: 0 },
    { ms: 10, range: 1 },
    { ms: 200, range: 3 },
    { ms: 600, range: 5 },
    { ms: 1000, range: 6 },
    { ms: 5000, range: 8 },
    { ms: 10000, range: 10 },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (ms >= a.ms && ms <= b.ms) {
      const t = (ms - a.ms) / (b.ms - a.ms);
      return a.range + t * (b.range - a.range);
    }
  }
  return 10;
}

// Convert 0-10 range back to milliseconds
function envelopeRangeToMs(range: number): number {
  if (range <= 0) return 0;
  if (range >= 10) return 10000;

  const stops = [
    { range: 0, ms: 0 },
    { range: 1, ms: 10 },
    { range: 3, ms: 200 },
    { range: 5, ms: 600 },
    { range: 6, ms: 1000 },
    { range: 8, ms: 5000 },
    { range: 10, ms: 10000 },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (range >= a.range && range <= b.range) {
      const t = (range - a.range) / (b.range - a.range);
      return a.ms + t * (b.ms - a.ms);
    }
  }
  return 10000;
}

export function knobPosToValue(pos: number, stops = attackDecayStops): number {
  // Handle boundary cases
  if (pos <= stops[0].pos) {
    return msToEnvelopeRange(stops[0].value);
  }
  if (pos >= stops[stops.length - 1].pos) {
    return msToEnvelopeRange(stops[stops.length - 1].value);
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (pos >= a.pos && pos <= b.pos) {
      const t = (pos - a.pos) / (b.pos - a.pos);
      const msValue = a.value + t * (b.value - a.value);
      // Convert milliseconds to 0-10 range for mapEnvelopeTime
      return msToEnvelopeRange(msValue);
    }
  }
  return msToEnvelopeRange(stops[stops.length - 1].value);
}

export function valueToKnobPos(
  value: number,
  stops = attackDecayStops
): number {
  // Convert 0-10 range back to milliseconds
  const msValue = envelopeRangeToMs(value);

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (msValue >= a.value && msValue <= b.value) {
      const t = (msValue - a.value) / (b.value - a.value);
      return a.pos + t * (b.pos - a.pos);
    }
  }
  return stops[stops.length - 1].pos;
}
