# Phase 21 — Production-Style Deployment Guide

## 1. Production Deployment Prerequisites
- Docker Engine 24.0+ and Docker Compose v2.20+.
- Valid SSL/TLS certificates configured in Nginx reverse proxy.
- Hardened `.env` file generated from `.env.example` with non-default passwords and secrets.

## 2. Production Deployment Steps
1. Generate production environment secrets:
   ```bash
   cp .env.example .env
   # Update JWT_SECRET, DATABASE_PASSWORD, DATABASE_ROOT_PASSWORD with strong 32+ char secrets
   ```
2. Launch production container stack:
   ```bash
   docker-compose up -d --build
   ```
3. Verify container health status:
   ```bash
   docker-compose ps
   ```
4. Verify backend health endpoint:
   ```bash
   curl -i http://localhost:5050/api/system/health
   ```
5. View production service logs:
   ```bash
   docker-compose logs -f --tail=100
   ```
