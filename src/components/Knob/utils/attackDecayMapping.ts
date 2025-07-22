// Mapping utility for attack/decay envelope knobs with non-linear scaling
// Values and positions are based on classic Minimoog envelope timing

export const attackDecayStops = [
  { pos: 0, value: 0 }, // 1 ms (or 0 ms if you want)
  { pos: 1000, value: 10 }, // 10 ms
  { pos: 2000, value: 200 }, // 200 ms
  { pos: 4000, value: 600 }, // 600 ms
  { pos: 6000, value: 1000 }, // 1 sec
  { pos: 8000, value: 5000 }, // 5 sec
  { pos: 10000, value: 10000 }, // 10 sec
];

export function knobPosToValue(pos: number, stops = attackDecayStops): number {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (pos >= a.pos && pos <= b.pos) {
      const t = (pos - a.pos) / (b.pos - a.pos);
      return a.value + t * (b.value - a.value);
    }
  }
  return stops[stops.length - 1].value;
}

export function valueToKnobPos(
  value: number,
  stops = attackDecayStops
): number {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (value >= a.value && value <= b.value) {
      const t = (value - a.value) / (b.value - a.value);
      return a.pos + t * (b.pos - a.pos);
    }
  }
  return stops[stops.length - 1].pos;
}
