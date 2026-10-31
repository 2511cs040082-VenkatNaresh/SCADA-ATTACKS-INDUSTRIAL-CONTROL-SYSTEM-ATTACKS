# Phase 20 — Comprehensive Test Plan

## 1. Scope & Coverage
This test plan covers all 20 phases of the ICS-SHIELD platform:
- Architecture & Infrastructure (Phases 1-3)
- Simulator & Pipeline (Phases 4-5)
- Asset, Network & Protocol Monitoring (Phases 6-7)
- Multi-Layer Detection (Rule, Behavioral Z-Score, ML Isolation Forest) (Phases 8-10)
- Alert & Incident Case Management (Phases 11-12)
- MITRE ATT&CK for ICS Integration (Phase 13)
- Defense & Response Engine (Phase 14)
- Attack Simulation Laboratory (Phase 15)
- Advanced SOC Dashboard (Phase 16)
- Reports & Analytics (Phase 17)
- Administration & Security Hardening (Phases 18-19)
- Comprehensive Validation & Testing (Phase 20)

## 2. Test Suites
| Suite Name | File Location | Key Test Scenarios |
|---|---|---|
| **Unit Tests** | `tests/unit/unit.test.js` | Math stats, Z-Score calculations, string sanitizers |
| **Database Tests** | `tests/database.test.js` | Schema migrations, seed data, CRUD, foreign keys, fallback |
| **API Endpoints** | `tests/api.test.js` | Health status, 401 unauthorized protection, login validation |
| **Asset Intelligence** | `tests/asset_intelligence.test.js` | Asset creation, risk score computation, health monitoring |
| **Network Monitoring** | `tests/network_monitoring.test.js` | Modbus TCP protocol parser, flow session recorder |
| **Rule Engine** | `tests/detection_engine.test.js` | Condition evaluator, Modbus FC violation, threshold cooldowns |
| **Behavioral Engine** | `tests/behavioral_engine.test.js` | Rolling window statistics, Z-score computation, baseline drift |
| **ML Engine** | `tests/ml_engine.test.js` | Isolation Forest scoring, contamination thresholds, inference |
| **Alert Management** | `tests/alert_management.test.js` | Alert deduplication, status transitions, priority routing |
| **Incident Workspace** | `tests/incident_management.test.js` | Incident creation, timeline logging, state transitions |
| **MITRE ATT&CK** | `tests/mitre_integration.test.js` | Matrix browsing, technique lookup, coverage mapping |
| **Response Engine** | `tests/response_engine.test.js` | Playbooks, approval engine, dry-run simulation, execution |
| **Simulation Lab** | `tests/simulation_engine.test.js` | Scenario lifecycle, preflight safety, run state management |
| **Reports & Analytics** | `tests/reports_analytics.test.js` | Report generation, PDF/CSV exporters, SHA-256 signatures |
| **Admin Center** | `tests/admin_center.test.js` | System configuration, audit logs, retention policies |
| **Security Hardening** | `tests/security_hardening.test.js` | JWT auth, rate limiting, RBAC separation of duties, sanitization |
| **Performance Benchmarks** | `tests/performance/performance.test.js` | API, DB, Detection, and Report generation latencies |
| **Failure Recovery** | `tests/recovery/failure_recovery.test.js` | DB connection failure fallback, simulator reset |
| **Master E2E Simulation** | `tests/e2e/master_simulation_e2e.test.js` | 18-stage complete incident and response lifecycle |

## 3. Execution Commands
To run the full suite:
```bash
node tests/run_all_tests.js
```
To run individual subsystem test suites:
```bash
node tests/unit/unit.test.js
node tests/e2e/master_simulation_e2e.test.js
node tests/performance/performance.test.js
node tests/recovery/failure_recovery.test.js
```
