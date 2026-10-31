# ICS-SHIELD — Incident Response & Triage Guide

## Lifecycle Stages
- `NEW` → `TRIAGED` → `INVESTIGATING` → `CONTAINMENT_RECOMMENDED` → `CONTAINMENT_IN_PROGRESS` → `RECOVERY_RECOMMENDED` → `RESOLVED` → `CLOSED`.
- All status transitions are validated by state machine `validateIncidentStateTransition()`.
