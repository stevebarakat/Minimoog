import { MIDI } from "@/config/constants";

// MIDI Status Bytes
export const MIDI_STATUS_BYTES = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  POLYPHONIC_KEY_PRESSURE: 0xa0,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_PRESSURE: 0xd0,
  PITCH_BEND: 0xe0,
  SYSTEM_EXCLUSIVE: 0xf0,
  TIME_CODE: 0xf1,
  SONG_POSITION: 0xf2,
  SONG_SELECT: 0xf3,
  TUNE_REQUEST: 0xf6,
  TIMING_CLOCK: 0xf8,
  START: 0xfa,
  CONTINUE: 0xfb,
  STOP: 0xfc,
  ACTIVE_SENSING: 0xfe,
  RESET: 0xff,
} as const;

// MIDI Control Change Numbers
export const MIDI_CONTROL_CHANGES = {
  MODULATION_WHEEL: 1,
  BREATH_CONTROLLER: 2,
  FOOT_CONTROLLER: 4,
  PORTAMENTO_TIME: 5,
  DATA_ENTRY_MSB: 6,
  CHANNEL_VOLUME: 7,
  BALANCE: 8,
  PAN: 10,
  EXPRESSION_CONTROLLER: 11,
  EFFECT_CONTROL_1: 12,
  EFFECT_CONTROL_2: 13,
  GENERAL_PURPOSE_CONTROLLER_1: 16,
  GENERAL_PURPOSE_CONTROLLER_2: 17,
  GENERAL_PURPOSE_CONTROLLER_3: 18,
  GENERAL_PURPOSE_CONTROLLER_4: 19,
  BANK_SELECT_MSB: 0,
  PORTAMENTO: 65,
  SUSTAIN: 64,
  PORTAMENTO_CONTROL: 84,
  SOSTENUTO: 66,
  SOFT_PEDAL: 67,
  LEGATO_FOOTSWITCH: 68,
  HOLD_2: 69,
  SOUND_CONTROLLER_1: 70,
  SOUND_CONTROLLER_2: 71,
  SOUND_CONTROLLER_3: 72,
  SOUND_CONTROLLER_4: 73,
  SOUND_CONTROLLER_5: 74,
  SOUND_CONTROLLER_6: 75,
  SOUND_CONTROLLER_7: 76,
  SOUND_CONTROLLER_8: 77,
  SOUND_CONTROLLER_9: 78,
  SOUND_CONTROLLER_10: 79,
  GENERAL_PURPOSE_CONTROLLER_5: 80,
  GENERAL_PURPOSE_CONTROLLER_6: 81,
  GENERAL_PURPOSE_CONTROLLER_7: 82,
  GENERAL_PURPOSE_CONTROLLER_8: 83,
  EFFECTS_1_DEPTH: 91,
  EFFECTS_2_DEPTH: 92,
  EFFECTS_3_DEPTH: 93,
  EFFECTS_4_DEPTH: 94,
  EFFECTS_5_DEPTH: 95,
  DATA_INCREMENT: 96,
  DATA_DECREMENT: 97,
  NON_REGISTERED_PARAMETER_NUMBER_LSB: 98,
  NON_REGISTERED_PARAMETER_NUMBER_MSB: 99,
  REGISTERED_PARAMETER_NUMBER_LSB: 100,
  REGISTERED_PARAMETER_NUMBER_MSB: 101,
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
  OMNI_MODE_OFF: 124,
  OMNI_MODE_ON: 125,
  MONO_MODE_ON: 126,
  POLY_MODE_ON: 127,
} as const;

// Type definitions
export type MIDINoteNumber = number; // 0-127
export type MIDIVelocity = number; // 0-127
export type MIDIControlValue = number; // 0-127
export type MIDIChannelNumber = number; // 1-16
export type MIDIProgramNumber = number; // 0-127
export type MIDIPitchBendValue = number; // 0-16383 (14-bit)

export type MIDIMessageType = keyof typeof MIDI_STATUS_BYTES;
export type MIDIControlChangeType = keyof typeof MIDI_CONTROL_CHANGES;

// MIDI Message parsing and creation
export interface MIDIMessage {
  type: MIDIMessageType;
  channel: MIDIChannelNumber;
  data: number[];
}

export interface MIDINoteMessage extends MIDIMessage {
  type: "NOTE_ON" | "NOTE_OFF";
  note: MIDINoteNumber;
  velocity: MIDIVelocity;
}

export interface MIDIControlChangeMessage extends MIDIMessage {
  type: "CONTROL_CHANGE";
  controller: MIDIControlValue;
  value: MIDIControlValue;
}

export interface MIDIPitchBendMessage extends MIDIMessage {
  type: "PITCH_BEND";
  value: MIDIPitchBendValue;
}

/**
 * Convert a MIDI note number to its note name.
 * @param midiNote - The MIDI note number (0-127)
 * @returns The note name (e.g., "C", "C#", "D", etc.)
 */
export function midiNoteToNoteName(midiNote: number): string {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  return noteNames[midiNote % 12];
}

/**
 * Convert a note name to its MIDI note number.
 * @param noteName - The note name (e.g., "C", "C#", "D", etc.)
 * @returns The MIDI note number (0-11)
 */
export function noteNameToMidiNote(noteName: string): number {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  return noteNames.indexOf(noteName.toUpperCase());
}

/**
 * Convert a MIDI note number to its frequency in Hz.
 * @param midiNote - The MIDI note number (0-127)
 * @returns The frequency in Hz
 */
export function midiNoteToFrequency(midiNote: number): number {
  return MIDI.A4_FREQUENCY * Math.pow(2, (midiNote - MIDI.A4_MIDI_NOTE) / 12);
}

/**
 * Convert a frequency in Hz to its MIDI note number.
 * @param frequency - The frequency in Hz
 * @returns The MIDI note number (0-127)
 */
export function frequencyToMidiNote(frequency: number): number {
  return Math.round(
    12 * Math.log2(frequency / MIDI.A4_FREQUENCY) + MIDI.A4_MIDI_NOTE
  );
}

/**
 * Convert a note string (e.g., "A4") to its MIDI note number.
 * @param note - The note string (e.g., "A4", "C#3")
 * @returns The MIDI note number (0-127)
 */
export function noteToMidiNote(note: string): number {
  const noteName = note.replace(/\d/g, "");
  const octave = parseInt(note.replace(/\D/g, ""));
  const noteNumber = noteNameToMidiNote(noteName);
  return noteNumber + (octave + 1) * 12;
}

/**
 * Convert a note string (e.g., "A4") to its frequency in Hz.
 * @param note - The note string (e.g., "A4", "C#3")
 * @returns The frequency in Hz
 */
export function noteToFrequency(note: string): number {
  return midiNoteToFrequency(noteToMidiNote(note));
}

/**
 * Convert a MIDI velocity value to a gain value (0-1).
 * @param velocity - The MIDI velocity value (0-127)
 * @returns The gain value (0-1)
 */
export function velocityToGain(velocity: MIDIVelocity): number {
  return velocity / 127;
}

/**
 * Convert a gain value (0-1) to a MIDI velocity value.
 * @param gain - The gain value (0-1)
 * @returns The MIDI velocity value (0-127)
 */
export function gainToVelocity(gain: number): MIDIVelocity {
  return Math.round(gain * 127);
}

/**
 * Convert a MIDI control value to a parameter value using various curves.
 * @param control - The MIDI control value (0-127)
 * @param range - The target range [min, max]
 * @param curve - The conversion curve type ("linear", "exponential", "logarithmic")
 * @returns The converted parameter value
 */
export function controlToValue(
  control: MIDIControlValue,
  range: [number, number],
  curve: "linear" | "exponential" | "logarithmic" = "linear"
): number {
  const normalized = control / 127;
  const [min, max] = range;

  switch (curve) {
    case "exponential":
      return min + (max - min) * Math.pow(normalized, 2);
    case "logarithmic":
      return min + ((max - min) * Math.log(1 + normalized * 9)) / Math.log(10);
    default:
      return min + (max - min) * normalized;
  }
}

/**
 * Convert a parameter value to a MIDI control value using various curves.
 * @param value - The parameter value
 * @param range - The source range [min, max]
 * @param curve - The conversion curve type ("linear", "exponential", "logarithmic")
 * @returns The MIDI control value (0-127)
 */
export function valueToControl(
  value: number,
  range: [number, number],
  curve: "linear" | "exponential" | "logarithmic" = "linear"
): MIDIControlValue {
  const [min, max] = range;
  const normalized = (value - min) / (max - min);

  let result: number;
  switch (curve) {
    case "exponential":
      result = Math.sqrt(normalized);
      break;
    case "logarithmic":
      result = (Math.pow(10, normalized) - 1) / 9;
      break;
    default:
      result = normalized;
  }

  return Math.round(result * 127);
}

/**
 * Convert a MIDI pitch bend value to a semitone offset.
 * @param bend - The MIDI pitch bend value (0-16383)
 * @returns The semitone offset (-2 to +2)
 */
export function pitchBendToValue(bend: MIDIPitchBendValue): number {
  const normalized = (bend - 8192) / 8192; // Center at 8192
  return normalized * 2; // ±2 semitones
}

/**
 * Convert a semitone offset to a MIDI pitch bend value.
 * @param value - The semitone offset (-2 to +2)
 * @returns The MIDI pitch bend value (0-16383)
 */
export function valueToPitchBend(value: number): MIDIPitchBendValue {
  const normalized = value / 2; // Normalize to ±1
  return Math.round((normalized + 1) * 8192);
}

/**
 * Parse MIDI message from raw data
 */
export function parseMIDIMessage(data: Uint8Array): MIDIMessage | null {
  if (data.length < 2) return null;

  const status = data[0];
  const messageType = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  switch (messageType) {
    case MIDI_STATUS_BYTES.NOTE_ON:
    case MIDI_STATUS_BYTES.NOTE_OFF:
      if (data.length < 3) return null;
      return {
        type:
          messageType === MIDI_STATUS_BYTES.NOTE_ON ? "NOTE_ON" : "NOTE_OFF",
        channel,
        note: data[1],
        velocity: data[2],
      } as MIDINoteMessage;

    case MIDI_STATUS_BYTES.CONTROL_CHANGE:
      if (data.length < 3) return null;
      return {
        type: "CONTROL_CHANGE",
        channel,
        controller: data[1],
        value: data[2],
      } as MIDIControlChangeMessage;

    case MIDI_STATUS_BYTES.PITCH_BEND: {
      if (data.length < 3) return null;
      const bendValue = data[1] + (data[2] << 7);
      return {
        type: "PITCH_BEND",
        channel,
        value: bendValue,
      } as MIDIPitchBendMessage;
    }

    default:
      return null;
  }
}

/**
 * Create MIDI message from components
 */
export function createMIDIMessage(
  type: MIDIMessageType,
  channel: MIDIChannelNumber,
  data: number[]
): Uint8Array {
  const status = MIDI_STATUS_BYTES[type] | ((channel - 1) & 0x0f);
  return new Uint8Array([status, ...data]);
}

/**
 * Validate MIDI message data
 */
export function validateMIDIMessage(data: Uint8Array): boolean {
  if (data.length === 0) return false;

  const status = data[0];
  const messageType = status & 0xf0;

  // Check minimum length for different message types
  switch (messageType) {
    case MIDI_STATUS_BYTES.NOTE_ON:
    case MIDI_STATUS_BYTES.NOTE_OFF:
    case MIDI_STATUS_BYTES.CONTROL_CHANGE:
      return data.length >= 3;
    case MIDI_STATUS_BYTES.PITCH_BEND:
      return data.length >= 3;
    case MIDI_STATUS_BYTES.PROGRAM_CHANGE:
    case MIDI_STATUS_BYTES.CHANNEL_PRESSURE:
      return data.length >= 2;
    default:
      return true; // System messages can have variable length
  }
}

/**
 * Exponential scaling for MIDI control values (used for modulation wheel, etc.)
 */
export function expScale(value: number): number {
  const normalized = value / 127;
  const scaled =
    normalized < 0.3
      ? normalized * (1 / 0.3) * 0.3
      : 0.3 + Math.pow((normalized - 0.3) / 0.7, 1.5) * 0.7;
  return Math.round(scaled * 100);
}

/**
 * Convert MIDI ticks to seconds based on tempo and resolution
 */
export function ticksToSeconds(
  ticks: number,
  tempo: number, // BPM
  resolution: number // ticks per quarter note
): number {
  const secondsPerBeat = 60 / tempo;
  return (ticks / resolution) * secondsPerBeat;
}

/**
 * Convert seconds to MIDI ticks based on tempo and resolution
 */
export function secondsToTicks(
  seconds: number,
  tempo: number, // BPM
  resolution: number // ticks per quarter note
): number {
  const secondsPerBeat = 60 / tempo;
  return Math.round((seconds / secondsPerBeat) * resolution);
}

/**
 * Clamp MIDI values to valid ranges
 */
export function clampMIDIValue(
  value: number,
  min: number = 0,
  max: number = 127
): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Check if a MIDI note is in a valid range
 */
export function isValidMIDINote(note: number): boolean {
  return note >= 0 && note <= 127;
}

/**
 * Check if a MIDI velocity is in a valid range
 */
export function isValidMIDIVelocity(velocity: number): boolean {
  return velocity >= 0 && velocity <= 127;
}

/**
 * Check if a MIDI control value is in a valid range
 */
export function isValidMIDIControlValue(value: number): boolean {
  return value >= 0 && value <= 127;
}

/**
 * Check if a MIDI pitch bend value is in a valid range
 */
export function isValidMIDIPitchBend(value: number): boolean {
  return value >= 0 && value <= 16383;
}
