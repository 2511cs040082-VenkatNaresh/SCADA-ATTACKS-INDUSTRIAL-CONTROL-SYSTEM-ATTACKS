import logger from '../logging/logger.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      const formattedErrors = error.errors ? error.errors.map(err => `${err.path.join('.')}: ${err.message}`) : [error.message];
      logger.warn(`Input validation error on ${req.method} ${req.originalUrl}: ${formattedErrors.join(', ')}`);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors,
        timestamp: new Date().toISOString()
      });
    }
  };
}
