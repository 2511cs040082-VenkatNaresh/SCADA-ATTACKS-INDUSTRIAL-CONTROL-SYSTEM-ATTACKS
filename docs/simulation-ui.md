# ICS-SHIELD Simulation Center & Full Simulation Story Mode

## 1. Overview
The **Simulation Center** (`/simulation` and `/simulation/story/:runId`) provides a full visual representation of attack scenario execution and end-to-end defensive security pipeline validation inside the isolated ICS-SHIELD laboratory environment.

---

## 2. Full Simulation Story Mode (13 Stages)

When a user launches a scenario (e.g. `SIM-MULTISTAGE-001`), the UI steps through a 13-stage visual progression driven by actual backend WebSocket events:

1. **STEP 1: NORMAL INDUSTRIAL OPERATION**
   - Displays baseline SCADA topology (`SCADA Server`, `HMI-001`, `PLC-001`, `RTU-001`, `Historian`) and normal process values (Tank level 68%, Pressure 4.8 bar).

2. **STEP 2: SIMULATED PROBLEM**
   - Highlights affected target (`PLC-001`), changed coil register states (`Coil 0x0004 OVERRIDDEN`), labeled `🧪 SIMULATION EVENT`.

3. **STEP 3: MONITORING**
   - Phase 7 deep packet inspection parses Modbus write coil frame.

4. **STEP 4: DETECTION**
   - Rule Engine, Behavioral Engine (+3.9 σ), and ML Model (0.94 score) trigger with evidence.

5. **STEP 5: ALERT**
   - SOC Alert `ALT-2026-981240` generated with severity HIGH.

6. **STEP 6: INVESTIGATION**
   - Incident `INC-2026-000001` opened in investigation workspace.

7. **STEP 7: MITRE CONTEXT**
   - Mapped to MITRE ATT&CK for ICS Technique `T0855 (Unauthorized Command Message)`.

8. **STEP 8: RESPONSE RECOMMENDATION**
   - Phase 14 Response Engine generates Plan `RSP-2026-000001`.

9. **STEP 9: ANALYST APPROVAL**
   - Human approval workflow with dry-run preview and separation of duties enforcement.

10. **STEP 10: SIMULATED RESPONSE**
    - Safe simulated device isolation executed inside lab with SHA-256 evidence logging.

11. **STEP 11: RECOVERY**
    - Simulator process parameters & device communications verified normalized.

12. **STEP 12: INCIDENT RESOLUTION**
    - Incident closed and audit record logged.

13. **STEP 13: FINAL RESULT**
    - Phase 15 Evaluation Engine summary matrix (`EXPECTED` vs `OBSERVED` vs `MISSING` vs `UNEXPECTED`).

---

## 3. Persistent Safety Status
A prominent `🧪 SIMULATION ACTIVE` banner stays visible whenever a simulation run is active so analysts never confuse laboratory simulations with real physical industrial activity.
