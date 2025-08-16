# Model D Synthesizer - Security Implementation Guide

## 🚀 Overview

This document provides a comprehensive guide to the security measures implemented in the Model D Synthesizer project. The implementation follows OWASP best practices and provides enterprise-grade protection against common web vulnerabilities.

## 🔒 Security Features Implemented

### 1. Content Security Policy (CSP)

**Purpose**: Prevents XSS attacks by controlling which resources can be loaded and executed.

**Implementation**:

- **XSS Protection**: Prevents cross-site scripting attacks
- **Nonce-based Script Validation**: Secure script execution with unique nonces
- **Resource Control**: Restricts resource loading to trusted sources
- **Clickjacking Prevention**: Blocks all framing attempts
- **Trusted Types**: DOM XSS prevention with strict typing

**CSP Directives**:

**Development Mode**:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' blob: ws: wss:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

**Production Mode (with Trusted Types)**:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'strict-dynamic'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; require-trusted-types-for 'script'; trusted-types 'default' 'policy-1';
```

### 2. HTTP Security Headers

#### X-Content-Type-Options: nosniff

- Prevents MIME type sniffing attacks
- Forces browsers to respect declared content types

#### X-Frame-Options: DENY

- Prevents clickjacking attacks
- Blocks all framing attempts

#### X-XSS-Protection: 1; mode=block

- Enables browser's built-in XSS protection
- Blocks rendering if XSS is detected

#### Referrer-Policy: strict-origin-when-cross-origin

- Controls referrer information in cross-origin requests
- Balances security with functionality

#### Permissions-Policy

- Restricts access to sensitive browser APIs
- Blocks camera, microphone, geolocation, payment, USB, and sensor access

#### Strict-Transport-Security (HSTS)

- Forces HTTPS connections
- Prevents protocol downgrade attacks
- Includes subdomains and preload directive

#### Cross-Origin Policies

- **COOP**: `same-origin` - Isolates browsing context
- **CORP**: `same-origin` - Restricts resource loading
- **COEP**: `require-corp` - Enables cross-origin isolation

#### Clear-Site-Data

- Secure logout and data clearing
- Clears cache, cookies, and storage on demand

### 3. Trusted Types

**Purpose**: Prevents DOM-based XSS by enforcing type safety for dangerous DOM operations.

**Implementation**:

- Custom policy for HTML, script, and URL creation
- Automatic sanitization of user inputs
- Fallback to safe alternatives when Trusted Types unavailable

### 4. Input Validation & Sanitization

#### User Input Validation

- **Preset Names**: Alphanumeric, spaces, hyphens, underscores only (max 100 chars)
- **MIDI Data**: Structure validation for status and data fields
- **Audio Parameters**: Numeric range validation (0-1, finite values only)

#### HTML Sanitization

- Automatic HTML entity encoding
- Safe DOM manipulation methods
- Trusted Types integration

### 5. Origin Isolation

**Purpose**: Prevents cross-origin attacks and data leakage.

**Implementation**:

- **COOP**: `same-origin` - Isolates browsing context
- **CORP**: `same-origin` - Restricts resource loading
- **COEP**: `require-corp` - Enables cross-origin isolation

### 6. Clickjacking Protection

**Multiple Layers**:

1. **X-Frame-Options: DENY** - Blocks all framing
2. **CSP frame-ancestors: 'none'** - Additional framing protection
3. **JavaScript frame busting** - Client-side protection

### 7. Development vs Production Security

#### Development Mode

- Relaxed CSP for development tools
- Source maps enabled for debugging
- HTTP allowed for local development
- Nonce-based script validation

#### Production Mode

- Strict CSP enforcement
- Source maps disabled
- HTTPS enforced
- All security headers active
- Trusted Types enforcement

## 🛠️ Implementation Details

### Development Environment

The security is implemented through a Vite plugin that automatically:

- Generates unique nonces for each request
- Sets security headers via server middleware
- Injects nonces into HTML scripts
- Maintains consistent nonce usage across CSP and HTML
- Applies security headers in both dev and preview modes

### Production Environment

For production deployment, use the configurations in `deploy-security.js`:

- **Nginx**: Add security headers to server config
- **Apache**: Use .htaccess file with security headers
- **Cloudflare**: Workers script
- **Vercel**: vercel.json configuration
- **Netlify**: \_headers file
- **Docker**: Security-hardened container configuration

## 📁 File Structure

```
├── security.config.js           # Central security configuration
├── vite-security-plugin.ts      # Vite plugin for security headers
├── deploy-security.js           # Production deployment configs
├── .htaccess                    # Apache security headers
├── vercel.json                  # Vercel deployment security
├── src/utils/security.ts        # Security utility functions
├── index.html                   # Security meta tags
├── vite.config.ts               # Security plugin integration
├── SECURITY.md                  # Additional security documentation
└── README-SECURITY.md           # This documentation
```

## 🚀 Quick Start

### 1. Development

```bash
npm run dev
```

Security headers are automatically applied via the Vite plugin.

### 2. Production Build

```bash
npm run build
```

Builds the project with security meta tags.

### 3. Production Deployment

Choose your deployment method from `deploy-security.js` and apply the appropriate configuration.

## 🔧 Configuration

### Security Headers

```typescript
// All security headers are automatically set
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Origin-Isolation: require-corp
Clear-Site-Data: "cache", "cookies", "storage"
```

## 🧪 Testing Security

### 1. CSP Testing

```bash
# Check security headers
curl -I http://localhost:5173 | grep -i "content-security-policy"

# Verify XSS protection
# Attempt to inject script tags and verify they're blocked
```

### 2. Header Testing

```bash
# Test security headers
curl -I http://localhost:5173 | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Strict-Transport-Security)"
```

### 3. Clickjacking Test

```html
<!-- This should be blocked -->
<iframe src="http://localhost:5173"></iframe>
```

## 🔍 Security Utilities

### Input Sanitization

```typescript
import { sanitizeInput, validateUrl, validateFileType } from "@/utils";

// Sanitize user input
const safeInput = sanitizeInput(userInput);

// Validate URLs
const isValidUrl = validateUrl(url);

// Validate file types
const isValidFile = validateFileType(file, ["audio/wav", "audio/mp3"]);
```

### Trusted HTML Creation

```typescript
import { createTrustedHtml, sanitizeHtml } from "@/utils";

// Create trusted HTML
const trustedHtml = createTrustedHtml(userHtml);

// Sanitize HTML content
const safeHtml = sanitizeHtml(userHtml);
```

### User Input Validation

```typescript
import { validateUserInput } from "@/utils";

// Validate preset names
const isValidPresetName = validateUserInput.presetName(presetName);

// Validate MIDI data
const isValidMidi = validateUserInput.midiData(midiData);

// Validate audio parameters
const isValidParam = validateUserInput.audioParam(value);
```

### Event Handler Security

```typescript
import { secureEventHandler } from "@/utils";

// Secure event handler
const secureHandler = secureEventHandler(originalHandler, [
  "trusted-domain.com",
]);
```

## 🚀 Deployment Security

### Nginx Configuration

```nginx
# Security Headers
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header Cross-Origin-Opener-Policy same-origin;
add_header Cross-Origin-Resource-Policy same-origin;
add_header Cross-Origin-Embedder-Policy require-corp;
add_header Origin-Isolation require-corp;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()";
```

### Apache .htaccess

```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Cross-Origin-Opener-Policy same-origin
Header always set Cross-Origin-Resource-Policy same-origin
Header always set Cross-Origin-Embedder-Policy require-corp
Header always set Origin-Isolation require-corp
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
```

### Docker Security

- Non-root user execution
- Read-only filesystem
- Temporary filesystem for volatile data
- Security options for privilege escalation prevention

## 🔍 Security Monitoring

### Event Logging

- XSS attempt detection
- CSRF attempt detection
- Rate limiting violations
- Unauthorized access attempts

### Alert Thresholds

- XSS attempts: 5 per hour
- Rate limit violations: 100 per hour
- Unauthorized access: 10 per hour

## 🚨 Incident Response

### Security Breach Response

1. **Immediate Action**: Block affected endpoints
2. **Investigation**: Analyze logs and evidence
3. **Containment**: Prevent further damage
4. **Recovery**: Restore secure state
5. **Post-Incident**: Review and improve

### Contact Information

- **Security Team**: security@your-domain.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Bug Bounty**: https://your-domain.com/security

## 📊 Compliance

### OWASP Top 10

- ✅ A01:2021 - Broken Access Control
- ✅ A02:2021 - Cryptographic Failures
- ✅ A03:2021 - Injection
- ✅ A04:2021 - Insecure Design
- ✅ A05:2021 - Security Misconfiguration
- ✅ A06:2021 - Vulnerable Components
- ✅ A07:2021 - Authentication Failures
- ✅ A08:2021 - Software and Data Integrity Failures
- ✅ A09:2021 - Security Logging Failures
- ✅ A10:2021 - Server-Side Request Forgery

### Security Standards

- CSP Level 3 compliance
- HSTS preload list eligibility
- Trusted Types implementation
- Modern browser security features

## 🔧 Troubleshooting

### Common Issues

#### 1. CSP Nonce Mismatch

**Problem**: Scripts blocked due to nonce mismatch
**Solution**: Ensure the Vite security plugin is properly configured

#### 2. Inline Scripts Blocked

**Problem**: Service worker registration fails
**Solution**: Verify nonce injection in HTML transformation

#### 3. External Scripts Blocked

**Problem**: Vite dev scripts can't load
**Solution**: Check CSP script-src directive includes necessary sources

### Debug Commands

```bash
# Check security headers
curl -I http://localhost:5173

# View HTML with nonces
curl -s http://localhost:5173 | grep -E "(nonce=|Content-Security-Policy)"

# Test specific security features
# (See testing section above)
```

## 📚 Best Practices

### 1. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Regular security audits

### 2. Input Validation

- Always validate user inputs
- Use parameterized queries
- Implement proper error handling

### 3. Principle of Least Privilege

- Minimal required permissions
- Restricted API access
- Secure defaults

### 4. Defense in Depth

- Multiple security layers
- Fail-safe defaults
- Comprehensive monitoring

## 📚 Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [MDN Security Documentation](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Trusted Types](https://web.dev/trusted-types/)
- [Security Headers](https://securityheaders.com/)

## 🤝 Contributing

When contributing to security features:

1. Follow OWASP guidelines
2. Test security measures thoroughly
3. Document any changes
4. Update this README as needed

## 📄 License

This security implementation is part of the Model D Synthesizer project.

---

**Last Updated**: December 2024
**Version**: 2.0
**Maintainer**: Security Team
**Status**: Production Ready ✅
