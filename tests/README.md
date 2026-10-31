# ICS-SHIELD Automated Testing & Quality Assurance Suite

## Overview
This directory contains the complete automated test suite for **ICS-SHIELD Phase 20 — Comprehensive Testing & Validation**.

## Test Directory Structure
```
tests/
├── unit/                       # Helper & Utility Unit Tests
├── database.test.js            # Database Schema & Fallback Tests
├── api.test.js                 # REST API & Middleware Tests
├── asset_intelligence.test.js  # Phase 6 Asset Intelligence Tests
├── network_monitoring.test.js  # Phase 7 Protocol Monitoring Tests
├── detection_engine.test.js    # Phase 8 Rule Detection Engine Tests
├── behavioral_engine.test.js   # Phase 9 Behavioral Anomaly Tests
├── ml_engine.test.js           # Phase 10 ML Isolation Forest Tests
├── alert_management.test.js    # Phase 11 Alert Manager Tests
├── incident_management.test.js # Phase 12 Incident Case Workspace Tests
├── mitre_integration.test.js   # Phase 13 MITRE ATT&CK for ICS Tests
├── response_engine.test.js     # Phase 14 Defense & Response Engine Tests
├── simulation_engine.test.js   # Phase 15 Simulation Laboratory Tests
├── reports_analytics.test.js   # Phase 17 Reports & Analytics Tests
├── admin_center.test.js        # Phase 18 Administration Center Tests
├── security_hardening.test.js  # Phase 19 Security Hardening Tests
├── performance/                # Performance & Latency Benchmarks
├── recovery/                   # Failure Recovery & Resilience Tests
├── e2e/                        # Master 18-Stage Simulation E2E Test
├── fixtures/                   # Test Fixtures & Synthetic Baselines
├── utilities/                  # Test Helpers & Matrix Evaluator
└── run_all_tests.js            # Master Test Suite Runner
```

## Running Tests
Run all 19 test suites sequentially:
```bash
node tests/run_all_tests.js
```

Run the Master 18-Stage End-to-End Simulation Test:
```bash
node tests/e2e/master_simulation_e2e.test.js
```
