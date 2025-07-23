// Utility for parameter clamping
export function clampParameter(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

// Utility to safely connect two audio nodes
export function connectNodes(source: AudioNode, destination: AudioNode) {
  try {
    source.connect(destination);
  } catch {
    // Already connected or invalid
  }
}

// Utility to safely disconnect an audio node
export function disconnectNode(node: AudioNode) {
  try {
    node.disconnect();
  } catch {
    // Already disconnected or invalid
  }
}

// Utility to reset a GainNode to a default value
export function resetGain(
  gainNode: GainNode,
  value: number,
  audioContext: AudioContext
) {
  gainNode.gain.setValueAtTime(value, audioContext.currentTime);
}

// Memoized glide time calculation
export function calculateGlideTime(glideTime: number): number {
  return Math.pow(10, glideTime / 5) * 0.02;
}

// Memoized volume calculation
export function calculateVolume(volume: number, volumeBoost: number): number {
  return Math.min(1, (volume / 10) * volumeBoost);
}
