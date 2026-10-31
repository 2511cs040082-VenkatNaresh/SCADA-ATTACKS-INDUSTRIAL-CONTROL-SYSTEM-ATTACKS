# Multi-Stage Production Frontend Dockerfile
# Stage 1: Build static React TS assets with Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Serve via hardened production Nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/configs/nginx.conf /etc/nginx/nginx.conf

# Security: Ensure non-root permissions for Nginx runtime caches
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html

USER nginx

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
