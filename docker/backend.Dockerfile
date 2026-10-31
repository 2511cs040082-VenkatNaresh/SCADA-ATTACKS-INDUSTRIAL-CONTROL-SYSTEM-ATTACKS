# Hardened Production Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install netcat for health & db readiness checks
RUN apk add --no-cache netcat-openbsd

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
COPY docker/scripts/entrypoint_backend.sh /entrypoint.sh
COPY docker/healthchecks/backend_health.js /app/healthcheck.js

RUN chmod +x /entrypoint.sh && \
    chown -R node:node /app

USER node

EXPOSE 5050

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node /app/healthcheck.js

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "src/server.js"]
