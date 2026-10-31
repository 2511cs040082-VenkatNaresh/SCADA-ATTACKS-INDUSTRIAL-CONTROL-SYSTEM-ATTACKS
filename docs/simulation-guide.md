# ICS-SHIELD — Attack Simulation Laboratory Guide

## Laboratory Safety Isolation Rules
- **Air-Gapped Network**: Simulations execute strictly inside the `LAB_SIMULATION` sandbox (`lab_net`).
- **Target Allowlist**: Restricted to synthetic inventory (`PLC-001`, `RTU-001`, `HMI-001`). External IP targets are blocked.
- **Story Mode** (`/simulation/story/:runId`): Interactive 13-step event-driven lifecycle demonstration driven by real backend WebSocket events.
- **Evaluation Matrix**: Auto-computes `EXPECTED_OBSERVED`, `EXPECTED_MISSING`, `UNEXPECTED_OBSERVED`, and `NOT_APPLICABLE` success rates.
