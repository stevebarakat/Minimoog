import log from "loglevel";

log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "debug");

/**
 * Report an error to the error reporting service (placeholder).
 * Extend this to send errors to a backend or external service.
 * @param error - The error to report
 * @param context - Optional context information about the error
 */
export function reportError(error: Error, context?: Record<string, unknown>) {
  log.error("[ErrorReporter]", error, context);
}

export default log;
