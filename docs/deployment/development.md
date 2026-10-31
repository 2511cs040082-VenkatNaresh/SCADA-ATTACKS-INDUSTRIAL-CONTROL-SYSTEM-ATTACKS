# Phase 21 — Development Environment Deployment Guide

## Quick Start for Local Development
1. Clone the repository and navigate to root directory:
   ```bash
   git clone <repo-url> && cd SCADA
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start development containers:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
4. Access services:
   - Backend API: `http://localhost:5050/api/system/health`
   - MySQL DB: `localhost:3306` (user: `icsshield_user`)
   - Detection Service: `http://localhost:8080/health`
   - Simulator: `http://localhost:8085/health`
5. Stop development containers:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```
