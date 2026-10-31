export const securityConfig = {
  saltRounds: 10,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 5000,         // Max requests per window
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3050', 'http://127.0.0.1:3050'],
  roles: {
    ADMIN: 'ADMIN',
    SECURITY_ANALYST: 'SECURITY_ANALYST',
    SOC_OPERATOR: 'SOC_OPERATOR',
    OT_OPERATOR: 'OT_OPERATOR',
    VIEWER: 'VIEWER',
  }
};
