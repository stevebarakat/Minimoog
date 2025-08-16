// Knob and range mapping utilities for envelope and parameter controls
import { ENVELOPE_MAPPING } from "@/config";

/**
 * Stops for mapping knob positions to envelope times (ms) and vice versa.
 */
export const attackDecayStops = ENVELOPE_MAPPING.ATTACK_DECAY_STOPS;

/**
 * Convert milliseconds to 0-10 envelope range (logarithmic mapping).
 * @param ms - Milliseconds
 * @returns Envelope range (0-10)
 */
export function msToEnvelopeRange(ms: number): number {
  if (ms <= 0) return 0;
  if (ms >= 10000) return 10;
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

/**
 * Convert 0-10 envelope range back to milliseconds (inverse mapping).
 * @param range - Envelope range (0-10)
 * @returns Milliseconds
 */
export function envelopeRangeToMs(range: number): number {
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

/**
 * Map knob position to envelope value (0-10 range).
 * @param pos - Knob position
 * @param stops - Mapping stops (default: attackDecayStops)
 * @returns Envelope value (0-10)
 */
export function knobPosToValue(pos: number, stops = attackDecayStops): number {
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
      return msToEnvelopeRange(msValue);
    }
  }
  return msToEnvelopeRange(stops[stops.length - 1].value);
}

/**
 * Map envelope value (0-10) to knob position.
 * @param value - Envelope value (0-10)
 * @param stops - Mapping stops (default: attackDecayStops)
 * @returns Knob position
 */
export function valueToKnobPos(
  value: number,
  stops = attackDecayStops
): number {
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
