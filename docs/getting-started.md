# ICS-SHIELD — Getting Started Guide

## Prerequisites
- Node.js v20.x or higher
- Docker Engine 24.0+ & Docker Compose v2.20+
- Git

## Quick Start (Docker Deployment)
1. Clone the repository and set up configuration:
   ```bash
   cp .env.example .env
   ```
2. Start the isolated laboratory simulation environment:
   ```bash
   docker-compose -f docker-compose.lab.yml up -d --build
   ```
3. Open Web UI in browser:
   `http://localhost` (or `http://localhost:5050`)
4. Log in using default credentials:
   - Username: `soc_analyst`
   - Password: `password123`
5. Run automated test suite:
   ```bash
   node tests/run_all_tests.js
   ```
