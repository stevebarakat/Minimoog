import { describe, it, expect } from "vitest";
import { getNoteForKey } from "../keyboardMapping";

describe("Keyboard Mapping", () => {
  describe("Minimoog-style mapping", () => {
    it("maps bottom row keys to correct notes starting with A=C", () => {
      // Test the main mapping according to user specification
      expect(getNoteForKey("a", 0)).toBe("C4"); // A = C1 (C4 with octave 0)
      expect(getNoteForKey("w", 0)).toBe("C#4"); // W = C#1
      expect(getNoteForKey("s", 0)).toBe("D4"); // S = D1
      expect(getNoteForKey("e", 0)).toBe("D#4"); // E = D#1
      expect(getNoteForKey("d", 0)).toBe("E4"); // D = E1
      expect(getNoteForKey("r", 0)).toBe(null); // R = null
      expect(getNoteForKey("f", 0)).toBe("F4"); // F = F1
      expect(getNoteForKey("t", 0)).toBe("F#4"); // T = F#1
      expect(getNoteForKey("g", 0)).toBe("G4"); // G = G1
      expect(getNoteForKey("y", 0)).toBe("G#4"); // Y = G#1
      expect(getNoteForKey("h", 0)).toBe("A4"); // H = A1
      expect(getNoteForKey("u", 0)).toBe("A#4"); // U = A#1
      expect(getNoteForKey("j", 0)).toBe("B4"); // J = B1
      expect(getNoteForKey("i", 0)).toBe(null); // I = null
      expect(getNoteForKey("k", 0)).toBe("C5"); // K = C2
      expect(getNoteForKey("o", 0)).toBe("C#5"); // O = C#2
      expect(getNoteForKey("l", 0)).toBe("D5"); // L = D2
      expect(getNoteForKey("p", 0)).toBe("D#5"); // P = D#2
      expect(getNoteForKey(";", 0)).toBe("E5"); // ; = E2
      expect(getNoteForKey("'", 0)).toBe("F5"); // ' = F2
    });

    it("handles capital letters the same as lowercase", () => {
      expect(getNoteForKey("A", 0)).toBe("C4");
      expect(getNoteForKey("W", 0)).toBe("C#4");
      expect(getNoteForKey("S", 0)).toBe("D4");
      expect(getNoteForKey("K", 0)).toBe("C5");
    });

    it("respects octave offset", () => {
      // Test with octave offset of -1 (should be C3 instead of C4)
      expect(getNoteForKey("a", -1)).toBe("C3");
      expect(getNoteForKey("k", -1)).toBe("C4");

      // Test with octave offset of +1 (should be C5 instead of C4)
      expect(getNoteForKey("a", 1)).toBe("C5");
      expect(getNoteForKey("k", 1)).toBe("C6");
    });

    it("returns null for unmapped keys", () => {
      expect(getNoteForKey("r", 0)).toBe(null);
      expect(getNoteForKey("i", 0)).toBe(null);
      expect(getNoteForKey("R", 0)).toBe(null);
      expect(getNoteForKey("I", 0)).toBe(null);
      expect(getNoteForKey("z", 0)).toBe(null);
      expect(getNoteForKey("1", 0)).toBe(null);
    });
  });
});
