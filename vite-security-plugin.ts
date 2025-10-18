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

        // Set CSP header with nonce for development (relaxed for local network access)
        const cspDirectives = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          "connect-src 'self' blob: ws: wss: ws://localhost:* wss://localhost:* https://www.google-analytics.com https://va.vercel-scripts.com",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self' https://www.upwork.com https://*.upwork.com",
          // Removed upgrade-insecure-requests for local development
        ].join("; ");

        res.setHeader("Content-Security-Policy", cspDirectives);

        // Set additional security headers (relaxed for local development)
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader(
          "Permissions-Policy",
          "camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        );
        // Removed strict CORS headers for local network access

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

        // Update CSP meta tag with proper nonce for development (relaxed for local network access)
        const cspContent = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          "connect-src 'self' blob: ws: wss: ws://localhost:* wss://localhost:* https://www.google-analytics.com https://va.vercel-scripts.com",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self' https://www.upwork.com https://*.upwork.com",
          // Removed upgrade-insecure-requests for local development
        ].join("; ");

        // Update CSP meta tag
        html = html.replace(
          /<meta http-equiv="Content-Security-Policy"[^>]*>/,
          `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`
        );

        // Add nonce to all scripts (both module and inline)
        html = html.replace(/<script([^>]*)>/g, (match, attributes) => {
          // Don't add nonce if it's already present
          if (attributes.includes("nonce=")) {
            return match;
          }
          return `<script${attributes} nonce="${currentNonce}">`;
        });

        return html;
      },
    },
  };
}
