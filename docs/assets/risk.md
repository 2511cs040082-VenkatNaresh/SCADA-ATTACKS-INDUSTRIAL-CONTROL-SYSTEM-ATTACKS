# Explainable Asset Risk Estimation Specification

## Risk Posture Model
Risk scores are deterministic posture estimates (labeled **`RISK ESTIMATE`**) calculated from factual operational and security inputs:

$$\text{RiskScore} = \text{BaseCriticalityWeight} + \text{SecurityAnomalyWeight} + \text{HealthInstabilityWeight}$$

### Factor Weights
1. **Operational Criticality**:
   - `CRITICAL`: +40
   - `HIGH`: +30
   - `MEDIUM`: +15
   - `LOW`: +5
2. **Security Anomalies**:
   - +15 per recent security/anomaly event (capped at +45)
3. **Availability Instability**:
   - `WARNING` / `DEGRADED`: +10
   - `OFFLINE`: +20

### Risk Levels
- **`LOW`**: Score 0 – 24
- **`MEDIUM`**: Score 25 – 49
- **`HIGH`**: Score 50 – 74
- **`CRITICAL`**: Score 75 – 100
