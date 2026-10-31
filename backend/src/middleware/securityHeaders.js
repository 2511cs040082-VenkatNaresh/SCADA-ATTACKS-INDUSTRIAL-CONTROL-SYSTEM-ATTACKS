import logger from '../logging/logger.js';

export function securityHeaders(req, res, next) {
  // 1. Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 2. Prevent Clickjacking / Framing
  res.setHeader('X-Frame-Options', 'DENY');

  // 3. XSS Protection Filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 4. Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http: https: ws: wss:; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
  );

  // 6. Strict Transport Security (HSTS) when operating over HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // 7. Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');

  // 8. Disable Cache for API endpoints to prevent sensitive data leakage
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
}
