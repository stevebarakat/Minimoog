import { securityConfig } from "../../security.config.js";

/**
 * Security utilities for the Model D Synthesizer
 * Provides input sanitization, validation, and security helpers
 */

// Input sanitization for XSS prevention
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// File type validation
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

// HTML content sanitization
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

// Script content sanitization
export const sanitizeScript = (script: string): string => {
  return script.replace(/[<>]/g, "");
};

// Trusted Types wrapper
export const createTrustedHtml = (html: string): TrustedHTML | string => {
  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    try {
      const policy = window.trustedTypes.createPolicy("security-policy", {
        createHTML: (string) => sanitizeHtml(string),
        createScript: (string) => sanitizeScript(string),
        createScriptURL: (string) =>
          validateUrl(string) ? string : "about:blank",
      });
      return policy.createHTML(html);
    } catch (error) {
      console.warn("Failed to create trusted HTML:", error);
      return sanitizeHtml(html);
    }
  }
  return sanitizeHtml(html);
};

// CSP nonce generation
export const generateNonce = (): string => {
  return securityConfig.generateNonce();
};

// Security validation for user inputs
export const validateUserInput = {
  // Validate preset names
  presetName: (name: string): boolean => {
    if (typeof name !== "string" || name.length === 0 || name.length > 100) {
      return false;
    }
    // Only allow alphanumeric, spaces, hyphens, and underscores
    return /^[a-zA-Z0-9\s\-_]+$/.test(name);
  },

  // Validate MIDI data
  midiData: (data: unknown): boolean => {
    if (!data || typeof data !== "object") return false;
    // Basic MIDI message validation
    const midiData = data as Record<string, unknown>;
    return midiData.status !== undefined && midiData.data !== undefined;
  },

  // Validate audio parameters
  audioParam: (value: number): boolean => {
    return (
      typeof value === "number" &&
      !isNaN(value) &&
      isFinite(value) &&
      value >= 0 &&
      value <= 1
    );
  },
};

// Security event logging
export const logSecurityEvent = (event: string, details?: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(`Security Event: ${event}`, details);
  }
  // In production, this could send to a security monitoring service
};

// DOM XSS prevention
export const safeSetInnerHTML = (element: HTMLElement, html: string): void => {
  try {
    const trustedHtml = createTrustedHtml(html);
    if (typeof trustedHtml === "string") {
      element.textContent = html; // Fallback to textContent
    } else {
      element.innerHTML = trustedHtml as string;
    }
  } catch (error) {
    logSecurityEvent("DOM XSS prevention failed", { error, html });
    element.textContent = html; // Safe fallback
  }
};

// Event handler security
export const secureEventHandler = <T extends Event>(
  handler: (event: T) => void,
  allowedOrigins?: string[]
): ((event: T) => void) => {
  return (event: T) => {
    try {
      // Validate event origin if specified
      if (allowedOrigins && "origin" in event) {
        const origin = (event as { origin?: string }).origin;
        if (origin && !allowedOrigins.includes(origin)) {
          logSecurityEvent("Blocked event from unauthorized origin", {
            origin,
          });
          return;
        }
      }

      handler(event);
    } catch (error) {
      logSecurityEvent("Event handler security error", { error, event });
    }
  };
};

export default {
  sanitizeInput,
  validateUrl,
  validateFileType,
  sanitizeHtml,
  sanitizeScript,
  createTrustedHtml,
  generateNonce,
  validateUserInput,
  logSecurityEvent,
  safeSetInnerHTML,
  secureEventHandler,
};
