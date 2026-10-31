import logger from '../logging/logger.js';

// Sanitize string inputs to prevent XSS script injection
export function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Detect and reject Path Traversal attempts
export function isPathTraversalAttempt(val) {
  if (typeof val !== 'string') return false;
  const decoded = decodeURIComponent(val);
  return decoded.includes('../') || decoded.includes('..\\') || decoded.includes('..%2f') || decoded.includes('..%5c');
}

// Middleware to sanitize request parameters and prevent path traversal / XSS
export function sanitizeInputMiddleware(req, res, next) {
  try {
    // 1. Check path parameters for path traversal
    for (const key of Object.keys(req.params)) {
      if (isPathTraversalAttempt(req.params[key])) {
        logger.warn(`[SECURITY VIOLATION] Path traversal attempt detected in param '${key}': ${req.params[key]}`);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid request parameter. Path traversal attempt rejected.',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Check query parameters for path traversal
    for (const key of Object.keys(req.query)) {
      if (isPathTraversalAttempt(req.query[key])) {
        logger.warn(`[SECURITY VIOLATION] Path traversal attempt detected in query '${key}': ${req.query[key]}`);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid query parameter. Path traversal attempt rejected.',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 3. Sanitize request body strings if present
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    next();
  } catch (err) {
    logger.error(`[SANITIZER ERROR] ${err.message}`);
    next();
  }
}

function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Do not strip passwords or explicit secrets during hash comparison
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('token')) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
