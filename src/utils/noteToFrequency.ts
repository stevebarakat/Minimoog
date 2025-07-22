export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;
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
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const n = noteNames.indexOf(name);
  if (n < 0 || isNaN(octave)) return 440;
  const midi = 12 * (octave + 1) + n;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  return isFinite(freq) ? freq : 440;
}
