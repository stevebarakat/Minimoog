/**
 * Production Deployment Security Configuration
 * Additional security measures for production deployment
 */

export const productionSecurityConfig = {
  // Nginx/Apache security headers
  nginxHeaders: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Origin-Isolation": "require-corp",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'strict-dynamic'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; require-trusted-types-for 'script'; trusted-types 'default' 'policy-1';",
  },

  // Apache .htaccess security headers
  apacheHeaders: `
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
Header always set Cross-Origin-Opener-Policy same-origin
Header always set Cross-Origin-Resource-Policy same-origin
Header always set Cross-Origin-Embedder-Policy require-corp
Header always set Origin-Isolation require-corp
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'strict-dynamic'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; require-trusted-types-for 'script'; trusted-types 'default' 'policy-1';"

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Prevent access to sensitive files
<FilesMatch "\.(htaccess|htpasswd|ini|log|sh|sql|conf)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Prevent directory browsing
Options -Indexes

# Prevent access to .git directory
RedirectMatch 404 /\.git

# Security: Prevent access to backup files
<FilesMatch "\.(bak|backup|old|orig|save|swp|tmp)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
  `,

  // Docker security configuration
  dockerSecurity: {
    // Dockerfile security best practices
    dockerfile: `
# Use non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Security: Don't run as root
USER 1001

# Security: Use specific base image version
FROM node:18-alpine AS base

# Security: Update packages and remove unnecessary ones
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Security: Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
    `,

    // Docker Compose security
    dockerCompose: `
version: '3.8'
services:
  app:
    build: .
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    `,
  },

  // Cloudflare security rules
  cloudflareRules: {
    // Security headers
    securityHeaders: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Origin-Isolation": "require-corp",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
    },

    // Firewall rules
    firewallRules: [
      {
        description: "Block malicious IPs",
        expression:
          '(http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/phpmyadmin") and ip.src ne 192.168.1.0/24',
        action: "block",
      },
      {
        description: "Rate limit requests",
        expression: "http.request.rate_limit > 100",
        action: "challenge",
      },
    ],

    // Page rules
    pageRules: [
      {
        url: "example.com/*",
        settings: {
          securityLevel: "high",
          ssl: "full",
          minify: { html: true, css: true, js: true },
        },
      },
    ],
  },

  // Security monitoring and logging
  monitoring: {
    // Log security events
    securityLogging: {
      enabled: true,
      events: [
        "XSS_ATTEMPT",
        "CSRF_ATTEMPT",
        "SQL_INJECTION_ATTEMPT",
        "RATE_LIMIT_EXCEEDED",
        "UNAUTHORIZED_ACCESS",
        "MALICIOUS_PAYLOAD",
      ],
      retention: "90d",
    },

    // Alert thresholds
    alerts: {
      xssAttempts: 5, // Alert after 5 XSS attempts per hour
      rateLimitExceeded: 100, // Alert after 100 rate limit violations per hour
      unauthorizedAccess: 10, // Alert after 10 unauthorized access attempts per hour
    },
  },
};

export default productionSecurityConfig;
