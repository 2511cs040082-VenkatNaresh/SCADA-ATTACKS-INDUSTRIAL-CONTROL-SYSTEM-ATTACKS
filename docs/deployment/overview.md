# ICS-SHIELD Deployment Guide

## Prerequisites
- Docker & Docker Compose v2+
- Node.js 20+ (for local development)
- Python 3.11+ (for local detection engine testing)

## Quick Start with Docker Compose
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Launch container stack
docker compose up --build -d

# 3. Verify running containers
docker compose ps
```
