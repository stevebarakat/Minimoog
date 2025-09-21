/**
 * Convert linear volume to logarithmic gain.
 * @param linearVolume - The linear volume value (0-maxVolume)
 * @param maxVolume - The maximum volume value (default: 10)
 * @returns The logarithmic gain value (0-1)
 */
export function linearToLogGain(
  linearVolume: number,
  maxVolume: number = 10
): number {
  const normalized = linearVolume / maxVolume;
  return Math.pow(normalized, 1.5);
}
