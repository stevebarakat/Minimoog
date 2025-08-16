/**
 * Security Configuration for Model D Synthesizer
 * Implements comprehensive security measures against XSS, clickjacking, and other attacks
 */

export const securityConfig = {
  // Content Security Policy (for meta tag - limited directives)
  csp: {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-eval'", // Required for Vite development
      "'strict-dynamic'",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for CSS modules
      "https://fonts.googleapis.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:"],
    "connect-src": [
      "'self'",
      "blob:",
      "ws:", // WebSocket for development
      "wss:", // Secure WebSocket
    ],
    "media-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "upgrade-insecure-requests": [],
  },

  // HTTP Security Headers (set via server middleware)
  headers: {
    // XSS Protection
    "X-XSS-Protection": "1; mode=block",

    // Content Type Sniffing Protection
    "X-Content-Type-Options": "nosniff",

    // Clickjacking Protection
    "X-Frame-Options": "DENY",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",

    // HSTS (HTTP Strict Transport Security)
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Cross-Origin Opener Policy
    "Cross-Origin-Opener-Policy": "same-origin",

    // Cross-Origin Resource Policy
    "Cross-Origin-Resource-Policy": "same-origin",

    // Cross-Origin Embedder Policy
    "Cross-Origin-Embedder-Policy": "require-corp",

    // Origin Isolation
    "Origin-Isolation": "require-corp",

    // Clear Site Data (for logout scenarios)
    "Clear-Site-Data": '"cache", "cookies", "storage"',

    // Feature Policy (deprecated but still supported)
    "Feature-Policy":
      "camera none; microphone none; geolocation none; payment none; usb none; magnetometer none; gyroscope none; accelerometer none",
  },

  // Trusted Types Policy
  trustedTypesPolicy: {
    name: "policy-1",
    createHTML: (string) => {
      // Sanitize HTML strings
      const div = document.createElement("div");
      div.textContent = string;
      return div.innerHTML;
    },
    createScript: (string) => {
      // Sanitize script strings
      return string.replace(/[<>]/g, "");
    },
    createScriptURL: (string) => {
      // Validate URLs
      try {
        const url = new URL(string);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return string;
        }
        throw new Error("Invalid URL protocol");
      } catch {
        throw new Error("Invalid URL");
      }
    },
  },

  // CSP Nonce Generator
  generateNonce: () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
    }
    // Fallback for environments without crypto
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },

  // Security Validation Functions
  validators: {
    // Validate input for XSS prevention
    sanitizeInput: (input) => {
      if (typeof input !== "string") return input;
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    },

    // Validate URLs
    validateUrl: (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },

    // Validate file uploads
    validateFileType: (file, allowedTypes) => {
      return allowedTypes.includes(file.type);
    },
  },
};

// Initialize Trusted Types if supported and in browser environment
if (
  typeof window !== "undefined" &&
  window.trustedTypes &&
  window.trustedTypes.createPolicy
) {
  try {
    window.trustedTypes.createPolicy(
      securityConfig.trustedTypesPolicy.name,
      securityConfig.trustedTypesPolicy
    );
  } catch (error) {
    console.warn("Failed to create Trusted Types policy:", error);
  }
}

export default securityConfig;
