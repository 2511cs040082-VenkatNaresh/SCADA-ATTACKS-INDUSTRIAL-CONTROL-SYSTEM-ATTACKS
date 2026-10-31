# Phase 21 — Containerized Testing Environment Guide

## Executing Automated Test Suite in Container
1. Launch test execution compose environment:
   ```bash
   docker-compose -f docker-compose.test.yml up --build --exit-code-from test-runner
   ```
2. What the containerized test run performs:
   - Initializes clean isolated MySQL database `ics_shield_test`.
   - Runs database migrations and schema seeds.
   - Executes all 19 automated test suites (`tests/run_all_tests.js`).
   - Runs the Master 18-Stage Simulation E2E Test.
   - Exits with exit code 0 on 100% success.
