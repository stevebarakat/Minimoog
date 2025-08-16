import type { Plugin } from "vite";
import { securityConfig } from "./security.config.js";

/**
 * Vite Security Plugin
 * Handles CSP nonce injection and security headers
 */
export function securityPlugin(): Plugin {
  let currentNonce: string | null = null;

  return {
    name: "vite-security-plugin",

    configureServer(server) {
      // Add security middleware
      server.middlewares.use((req, res, next) => {
        // Generate nonce for CSP if not already generated
        if (!currentNonce) {
          currentNonce = securityConfig.generateNonce();
        }

        // Set CSP header with nonce and frame-ancestors for development
        const cspDirectives = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'nonce-" + currentNonce + "'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self'",
          "img-src 'self' data: blob:",
          "connect-src 'self' blob: ws: wss:",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'", // Prevents clickjacking
          "upgrade-insecure-requests",
        ].join("; ");

        res.setHeader("Content-Security-Policy", cspDirectives);

        // Set additional security headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader(
          "Permissions-Policy",
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        );
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Origin-Isolation", "require-corp");
        res.setHeader(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains; preload"
        );

        next();
      });
    },

    transformIndexHtml: {
      order: "pre",
      handler(html) {
        // Use the same nonce that was generated for the server
        if (!currentNonce) {
          currentNonce = securityConfig.generateNonce();
        }

        // Update CSP meta tag with proper nonce for development
        const cspContent = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'nonce-" + currentNonce + "'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self'",
          "img-src 'self' data: blob:",
          "connect-src 'self' blob: ws: wss:",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join("; ");

        // Update CSP meta tag
        html = html.replace(
          /<meta http-equiv="Content-Security-Policy"[^>]*>/,
          `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`
        );

        // Add nonce to all scripts (both module and inline)
        html = html.replace(/<script([^>]*)>/g, (match, attributes) => {
          return `<script${attributes} nonce="${currentNonce}">`;
        });

        return html;
      },
    },
  };
}
