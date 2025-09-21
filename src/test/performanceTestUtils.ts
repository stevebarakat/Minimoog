export class PerformanceAssertions {
  static expectLatencyBelow(
    actualLatency: number,
    maxLatency: number,
    tolerance = 0.1
  ) {
    expect(actualLatency).toBeLessThan(maxLatency * (1 + tolerance));
  }

  static expectThroughputAbove(
    actualThroughput: number,
    minThroughput: number,
    tolerance = 0.1
  ) {
    expect(actualThroughput).toBeGreaterThan(minThroughput * (1 - tolerance));
  }

  static expectNoGlitches(glitchCount: number) {
    expect(glitchCount).toBe(0);
  }

  static expectStablePerformance(measurements: number[], maxVariance = 0.2) {
    if (measurements.length < 2) return;

    const mean =
      measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const variance =
      measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      measurements.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    expect(coefficientOfVariation).toBeLessThan(maxVariance);
  }
}

export function profilePerformance<T>(
  fn: () => T,
  iterations = 1000
): { result: T; averageTime: number; minTime: number; maxTime: number } {
  const times: number[] = [];
  let result: T;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = fn();
    const end = performance.now();
    times.push(end - start);
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return { result: result!, averageTime, minTime, maxTime };
}

export function measureLatency(fn: () => void, iterations = 100): number {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  // Return median latency for more stable measurement
  const sortedTimes = times.sort((a, b) => a - b);
  const mid = Math.floor(sortedTimes.length / 2);
  return sortedTimes.length % 2 === 0
    ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
    : sortedTimes[mid];
}
