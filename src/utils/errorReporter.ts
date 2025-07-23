import logger from "./logger";

/**
 * Report an error to the error reporting service (placeholder).
 * Extend this to send errors to a backend or external service.
 */
export function reportError(error: Error, context?: Record<string, unknown>) {
  logger.error("[ErrorReporter]", error, context);
  // TODO: Send error to backend or external service
}
