import { MIDI } from "@/config";

/**
 * Get octave range multiplier
 * @param {string} range - The octave range identifier
 * @returns {number} The multiplier value for the given range, or 1 if not found
 */
export function getOctaveRangeMultiplier(range: string): number {
  return MIDI.OCTAVE_RANGES[range as keyof typeof MIDI.OCTAVE_RANGES] ?? 1;
}

/**
 * Convert MIDI note number to note name
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string} Note name with octave (e.g., "C4", "F#5")
 */
export function midiToNoteName(midiNote: number): string {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${MIDI.NOTE_NAMES[noteIndex]}${octave}`;
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
 * Convert a note string (e.g., "A4") to its frequency in Hz.
 * @param note - The note string (e.g., "A4", "C#3")
 * @returns The frequency in Hz
 */
export function noteToFrequency(note: string): number {
  return midiNoteToFrequency(noteToMidiNote(note));
}

/**
 * Convert a note string (e.g., "A4") to its MIDI note number.
 * @param note - The note string (e.g., "A4", "C#3")
 * @returns The MIDI note number (0-127)
 */
export function noteToMidiNote(note: string): number {
  // Extract the note name (everything before the last digit)
  const noteNameMatch = note.match(/^([A-G]#?)(\d+)$/);
  if (!noteNameMatch) {
    return 69;
  }

  const noteName = noteNameMatch[1];
  const octave = parseInt(noteNameMatch[2]);

  const noteIndex = MIDI.NOTE_NAMES.indexOf(
    noteName as
      | "C"
      | "C#"
      | "D"
      | "D#"
      | "E"
      | "F"
      | "F#"
      | "G"
      | "G#"
      | "A"
      | "A#"
      | "B"
  );

  // If note name is not found, default to A4 (69)
  if (noteIndex === -1) {
    return 69;
  }

  return noteIndex + (octave + 1) * 12;
}
