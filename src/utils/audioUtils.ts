/**
 * Clamp a value between a minimum and maximum range.
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value between min and max
 */
export function clampParameter(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely disconnect an audio node from all its connections.
 * @param node - The audio node to disconnect
 */
export function disconnectNode(node: AudioNode) {
  try {
    node.disconnect();
  } catch {
    // Already disconnected or invalid
  }
}

/**
 * Reset a gain node's value at the current audio context time.
 * @param gainNode - The gain node to reset
 * @param value - The new gain value
 * @param audioContext - The audio context for timing
 */
export function resetGain(
  gainNode: GainNode,
  value: number,
  audioContext: AudioContext
) {
  gainNode.gain.setValueAtTime(value, audioContext.currentTime);
}

/**
 * Calculate glide time from a linear control value using exponential scaling.
 * @param glideTime - The linear control value (0-10)
 * @returns The calculated glide time in seconds
 */
export function calculateGlideTime(glideTime: number): number {
  return Math.pow(10, glideTime / 5) * 0.02;
}

/**
 * Calculate volume from a linear control value with optional boost.
 * @param volume - The linear volume control value (0-10)
 * @param volumeBoost - Optional volume boost multiplier
 * @returns The calculated volume value (0-1)
 */
export function calculateVolume(volume: number, volumeBoost: number): number {
  return Math.min(1, (volume / 10) * volumeBoost);
}

// Error handling types
export type ErrorContext = {
  component?: string;
  function?: string;
  audioContext?: AudioContext;
  parameter?: string;
  value?: number;
  [key: string]: unknown;
};

export type AudioError = {
  type: "AUDIO_NODE_CREATION" | "AUDIO_PARAMETER" | "AUDIO_CONNECTION";
  message: string;
  originalError: Error;
  context?: ErrorContext;
  timestamp: number;
};
