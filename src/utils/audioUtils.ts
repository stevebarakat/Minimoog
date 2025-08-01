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
 * Safely connect two audio nodes, handling any connection errors.
 * @param source - The source audio node
 * @param destination - The destination audio node
 */
export function connectNodes(source: AudioNode, destination: AudioNode) {
  try {
    source.connect(destination);
  } catch {
    // Already connected or invalid
  }
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

/**
 * Handle audio node creation errors with detailed context.
 * @param nodeType - The type of audio node that failed to create
 * @param error - The original error that occurred
 * @param context - Optional context information about the error
 * @returns A structured AudioError object
 */
export function handleNodeCreationError(
  nodeType: string,
  error: Error,
  context?: ErrorContext
): AudioError {
  return {
    type: "AUDIO_NODE_CREATION",
    message: `Failed to create ${nodeType} node: ${error.message}`,
    originalError: error,
    context,
    timestamp: Date.now(),
  };
}

/**
 * Handle audio parameter errors with detailed context.
 * @param parameterName - The name of the parameter that failed
 * @param value - The value that was being set
 * @param error - The original error that occurred
 * @param context - Optional context information about the error
 * @returns A structured AudioError object
 */
export function handleParameterError(
  parameterName: string,
  value: number,
  error: Error,
  context?: ErrorContext
): AudioError {
  return {
    type: "AUDIO_PARAMETER",
    message: `Failed to set parameter ${parameterName} to ${value}: ${error.message}`,
    originalError: error,
    context: { ...context, parameter: parameterName, value },
    timestamp: Date.now(),
  };
}

/**
 * Safely set an audio parameter with error handling and timing.
 * @param param - The audio parameter to set
 * @param value - The value to set
 * @param startTime - The time to start the parameter change
 * @returns True if successful, false if an error occurred
 */
export function safeSetAudioParameter(
  param: AudioParam,
  value: number,
  startTime: number
): boolean {
  try {
    param.setValueAtTime(value, startTime);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logError(handleParameterError("unknown", value, error));
    }
    return false;
  }
}

/**
 * Log an audio error with optional context information.
 * @param error - The error to log (AudioError, Error, or string)
 * @param context - Optional context information about the error
 */
export function logError(
  error: AudioError | Error | string,
  context?: ErrorContext
) {
  const errorMessage = typeof error === "string" ? error : error.message;
  const fullContext =
    typeof error === "object" && "context" in error
      ? { ...context, ...error.context }
      : context;

  console.error(`[Audio Error] ${errorMessage}`, fullContext);
}

/**
 * Log an audio warning with optional context information.
 * @param message - The warning message to log
 * @param context - Optional context information about the warning
 */
export function logWarning(message: string, context?: ErrorContext) {
  console.warn(`[Audio Warning] ${message}`, context);
}
