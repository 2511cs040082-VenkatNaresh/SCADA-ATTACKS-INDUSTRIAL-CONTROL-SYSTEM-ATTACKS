# System Configuration & Parameter Administration

## 16 Configuration Categories

All platform parameters are categorized into 16 distinct operational domains:
- `General`, `Security`, `Telemetry`, `Detection`, `Behavior`, `ML`, `Alerts`, `Incidents`, `MITRE`, `Response`, `Simulation`, `Reports`, `Retention`, `Logging`, `WebSocket`, `Performance`.

### Parameter Validation & Audit Rules
- **Bounds Checking**: Numeric values enforce strict min and max bounds.
- **Dangerous Settings**: High-impact parameter edits trigger explicit UI warning modals before submission.
- **Audited History**: Every setting edit creates a versioned entry in `configuration_history` and emits an append-only audit event.
- **Rollback**: Administrators can restore previous versions at any time.
