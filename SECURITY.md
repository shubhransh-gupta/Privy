# Security Policy

## Our Commitment

LocalTools is built with **privacy by architecture**. We take security seriously because our users trust us with sensitive files and data.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email or open a private security advisory on GitHub
3. Include steps to reproduce and potential impact

We will respond within 7 days and work to fix confirmed vulnerabilities promptly.

## Security Architecture

### Local Processing

- All core tools process data in the browser using Web APIs
- No file upload endpoints exist
- No server-side processing of user content

### Encryption

- File encryption uses **Web Crypto API** with AES-256-GCM
- Key derivation uses **PBKDF2** with 100,000+ iterations
- We do NOT implement custom cryptography

### Data Storage

- Favorites and recent tools: `localStorage` only
- No cookies for tracking
- No third-party analytics

### What We Don't Do

- Upload files to servers
- Store passwords or encryption keys remotely
- Track file contents or tool usage on servers
- Require user accounts

## Known Limitations

| Area | Limitation |
|------|-----------|
| JWT Decoder | Decodes only — does NOT verify signatures |
| PDF Compression | Browser-based; limited compared to server tools |
| Invoice Parser | Pattern matching — not AI/OCR extraction |
| Salary Calculator | Estimates only — not tax advice |
| Hash (MD5/SHA-1) | Legacy algorithms — labeled as weak |
| Large Files | Browser memory limits (~500MB practical max) |

## Redaction

Image redaction permanently modifies exported pixels. Redacted areas cannot be recovered from the exported file. However, users should verify redaction before sharing.

## Dependencies

We use well-maintained open-source libraries (pdf-lib, pdfjs-dist, js-yaml, exifr). Dependencies are regularly updated. Run `npm audit` before deploying.

## Browser Security

LocalTools relies on browser sandboxing. Users should:
- Keep browsers updated
- Use HTTPS (enforced on GitHub Pages)
- Be cautious with encrypted files — lost passwords cannot be recovered

## Open Source

All code is auditable at [github.com/shubhranshgupta/Privy](https://github.com/shubhranshgupta/Privy). We encourage security researchers to review the implementation.
