# Simulation Administration & Safety Boundaries

## Laboratory Control & Scenario Lifecycle

Administrators control the **ICS Attack Simulation Laboratory** via `/admin/simulation`:
- **Scenario Lifecycle States**: `DRAFT` $\rightarrow$ `READY` $\rightarrow$ `VALIDATING` $\rightarrow$ `APPROVED` $\rightarrow$ `ENABLED` $\rightarrow$ `DISABLED` $\rightarrow$ `RETIRED`.
- **Approval Policy**: Only scenarios marked as `APPROVED` and `ENABLED` can execute inside the laboratory simulator.
- **Fail-Closed Safety Boundaries**: Target selection is restricted strictly to allowlisted laboratory assets (`PLC-001`, `RTU-001`, `HMI-001`). Real SCADA assets or external IP addresses fail closed.
- **Visual Warning Banners**: The UI displays prominent `🧪 LAB SIMULATION ONLY` badges.
