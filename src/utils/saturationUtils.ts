/**
 * Saturation utilities for adding analog warmth to the Minimoog sound
 * Provides various saturation algorithms inspired by analog circuitry
 */

/**
 * Creates a waveshaper node with Minimoog-style analog saturation
 * This adds the characteristic "buzz" and warmth of the original hardware
 */
export function createMinimoogSaturation(
  audioContext: AudioContext
): WaveShaperNode {
  const waveshaper = audioContext.createWaveShaper();
  const samples = 1024;
  const curve = new Float32Array(samples);

  // Create a subtle analog-style saturation curve
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1; // -1 to 1

    // Multi-stage saturation inspired by transistor circuits
    let output = x;

    // First stage: add some gain and slight saturation even at low levels
    if (Math.abs(x) < 0.2) {
      output = x * 1.15; // More noticeable boost for low levels
      // Add subtle 2nd harmonic for warmth
      output += x * x * 0.08;
    }
    // Second stage: more aggressive saturation for mid levels
    else if (Math.abs(x) < 0.6) {
      const sign = x >= 0 ? 1 : -1;
      const abs = Math.abs(x);
      const t = (abs - 0.2) / 0.4;
      // More aggressive compression with harmonic enhancement
      output = sign * (0.2 + t * 0.4 * (1 - 0.25 * t));
      // Add 3rd harmonic for buzz
      output += sign * abs * abs * 0.12;
    }
    // Third stage: aggressive saturation for high levels
    else {
      const sign = x >= 0 ? 1 : -1;
      const abs = Math.abs(x);
      // More asymmetric clipping for analog character
      const asymmetry = sign > 0 ? 1.0 : 0.92; // More asymmetry
      output = sign * asymmetry * (0.8 + 0.2 * Math.tanh((abs - 0.6) * 6));
      // Add strong harmonics for buzz
      output += sign * Math.pow(abs, 1.5) * 0.15;
    }

    // Add more aggressive even harmonic distortion for buzz
    output += Math.sin(x * Math.PI) * 0.015;
    // Add 3rd harmonic for that characteristic buzz
    output += Math.sin(x * Math.PI * 3) * 0.008;

    curve[i] = output;
  }

  waveshaper.curve = curve;
  waveshaper.oversample = "2x"; // Reduce aliasing

  return waveshaper;
}

/**
 * Creates a more aggressive saturation for filter feedback
 */
export function createFilterSaturation(
  audioContext: AudioContext
): WaveShaperNode {
  const waveshaper = audioContext.createWaveShaper();
  const samples = 512;
  const curve = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;

    // More aggressive saturation for filter feedback
    let output = Math.tanh(x * 1.5) * 0.9;

    // Add subtle harmonic enhancement
    if (Math.abs(x) > 0.1) {
      output += Math.sin(x * Math.PI * 3) * 0.015 * Math.abs(x);
    }

    curve[i] = output;
  }

  waveshaper.curve = curve;
  waveshaper.oversample = "2x";

  return waveshaper;
}

/**
 * Creates a subtle tape-style saturation for master output
 */
export function createTapeSaturation(
  audioContext: AudioContext
): WaveShaperNode {
  const waveshaper = audioContext.createWaveShaper();
  const samples = 2048;
  const curve = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;

    // Tape-style saturation with gentle compression
    let output = x;

    if (Math.abs(x) > 0.5) {
      const sign = x >= 0 ? 1 : -1;
      const abs = Math.abs(x);
      // Gentle tape-style compression
      output = sign * (0.5 + (abs - 0.5) * (1 - (abs - 0.5) * 0.3));
    }

    // Add subtle tape-style harmonics
    output += Math.sin(x * Math.PI * 2) * 0.005;

    curve[i] = output;
  }

  waveshaper.curve = curve;
  waveshaper.oversample = "4x"; // Higher quality for master output

  return waveshaper;
}
