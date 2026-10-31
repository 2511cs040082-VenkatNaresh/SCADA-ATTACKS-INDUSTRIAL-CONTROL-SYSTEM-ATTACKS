# ICS-SHIELD Analyst Investigation & Incident Workflow

## 1. Conceptual Security Pipeline
ICS-SHIELD enforces an explicit, un-merged pipeline progression:

$$\text{EVENT} \longrightarrow \text{DETECTION} \longrightarrow \text{ALERT} \longrightarrow \text{INCIDENT} \longrightarrow \text{MITRE MAPPING} \longrightarrow \text{RESPONSE}$$

- **EVENT**: Raw telemetry packet or SCADA protocol message.
- **DETECTION**: Trigger output from Rule Engine, Behavioral Engine, or ML Model.
- **ALERT**: Aggregated, deduplicated SOC Alert in Alert Console.
- **INCIDENT**: Correlated investigation workspace uniting multiple related alerts.

---

## 2. Investigation Workspace Features
Inside `/incidents/:id`, analysts have dedicated tabs for:
- **Case Overview**: Root Cause & Operational Impact Assessment.
- **Investigation Timeline**: Chronological event correlation.
- **SHA-256 Evidence Store**: Hashed forensic evidence files.
- **Action Tasks**: Investigator task board.
- **Hypotheses & Findings**: Classified findings categorized explicitly as:
  - `Observed Fact`
  - `Hypothesis`
  - `Finding`
  - `Root Cause`
  - `Analyst Decision`
- **Notes & Audit**: Append-only analyst commentary.

No unconfirmed conclusion is automatically marked as confirmed without explicit analyst selection.
