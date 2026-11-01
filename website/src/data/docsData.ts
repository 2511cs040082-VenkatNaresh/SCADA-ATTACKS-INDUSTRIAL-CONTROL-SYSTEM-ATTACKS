export interface DocSection {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  codeSnippet?: string;
}

export const DOCS_DATA: DocSection[] = [
  {
    id: 'overview',
    category: 'Getting Started',
    title: 'Project Overview & Philosophy',
    summary: 'Core defensive mission, scope, Purdue Model classification, and isolation principles.',
    content: `ICS-SHIELD is an isolated, defensive cybersecurity platform built to bridge the critical gap between Information Technology (IT) security operations centers and Operational Technology (OT) industrial control environments.

Industrial systems govern critical physical infrastructure: water treatment plants, power grids, manufacturing pipelines, and chemical refineries. Traditional IT security tools (active vulnerability scanners, intrusive agents) cannot safely operate in OT networks because active probe packets can fault sensitive programmable logic controllers (PLCs) or cause catastrophic physical shutdowns.

ICS-SHIELD addresses this challenge by providing:
1. Passive, zero-impact deep packet inspection and network monitoring across industrial protocols.
2. An isolated digital-twin simulation laboratory where cyberattacks can be safely injected, monitored, and mitigated without contacting real physical OT machinery.
3. Strict human-in-the-loop authorization for all defensive response playbooks.`,
    codeSnippet: `# Verification of defensive environment isolation:
cat .env | grep -E "SIMULATION_MODE|ENVIRONMENT"
# Expected output:
# ENVIRONMENT=LAB_SIMULATION
# SIMULATION_MODE=true`
  },
  {
    id: 'architecture',
    category: 'Architecture',
    title: 'Technical System Architecture',
    summary: 'Four-tier decoupled architecture: Frontend UI, Node.js Gateway, Python ML Engine, and MySQL Store.',
    content: `ICS-SHIELD operates as four tightly integrated, decoupled subsystems:

1. Frontend Unified SOC Interface:
   Built with React 18, TypeScript, Vite, and Tailwind CSS. Provides a unified command center across 14 KPI telemetry domains, physical water process visualization, topological network graphs, and interactive incident investigation.

2. Backend API & Real-Time Event Bus:
   Built on Node.js 20 and Express with native WebSocket broadcast streaming. Enforces Role-Based Access Control (RBAC), sanitized input validation, rate limiting, and standard event envelope dispatching.

3. Python ML & Detection Engine:
   Powered by FastAPI and Scikit-Learn. Houses the statistical Z-score baseline profiler and unsupervised Isolation Forest anomaly detection pipeline.

4. Data Layer & Lab Simulator:
   MySQL 8 with connection pooling for relational persistence, with automated in-memory baseline fallback when running in lightweight standalone desktop mode.`,
    codeSnippet: `Frontend (React 18 + TS)
       │ (REST APIs / Authenticated WebSocket Stream)
       ▼
Backend Service (Node.js 20 + Express + WS Engine)
       │ (SQL Pool)
       ├──────────────► MySQL Database (icsshield_db / Volume Persistence)
       │
       ▼ (HTTP Async REST)
Python Detection Engine (FastAPI + ML Anomaly Pipeline)`
  },
  {
    id: 'protocols',
    category: 'Protocols',
    title: 'Industrial Protocol Inspection Reference',
    summary: 'Detailed specification of Modbus TCP, DNP3, and Siemens S7comm protocol decoders.',
    content: `ICS-SHIELD features native protocol parsing for the three most prevalent industrial communication standards:

1. Modbus TCP (Port 502):
   - Decodes MBAP Header (Transaction ID, Protocol ID, Length, Unit Identifier).
   - Validates Function Codes: FC01 (Read Coils), FC02 (Read Discrete Inputs), FC03 (Read Holding Registers), FC04 (Read Input Registers), FC05 (Write Single Coil), FC06 (Write Single Register), FC15 (Write Multiple Coils), FC16 (Write Multiple Registers).
   - Automatically flags unauthorized write operations (FC05/FC15) and register boundary overruns.

2. DNP3 (Port 20000):
   - Decodes Transport and Data Link headers, Object Groups, and Variation codes.
   - Monitors master polling cycles, unsolicited response bursts, and Control Relay Output Block (CROB) operations.

3. Siemens S7comm (Port 102):
   - Operates over ISO-on-TCP (RFC 1006) and COTP (ISO 8073).
   - Inspects Job, Ack-Data, and Userdata messages.
   - Specifically monitors PLC Key-Switch transitions between RUN, STOP, and PROGRAM modes.`,
    codeSnippet: `// Example Modbus Inspection Rule evaluated by ICS-SHIELD:
if (packet.protocol === 'MODBUS_TCP' && (packet.function_code === 5 || packet.function_code === 15)) {
  if (!authorizedControllers.includes(packet.source_ip)) {
    emitDetection('UNAUTHORIZED_MODBUS_WRITE_COIL', {
      target_asset: 'PLC-001',
      severity: 'HIGH',
      tactic: 'T0855'
    });
  }
}`
  },
  {
    id: 'detection',
    category: 'Detection',
    title: 'Triple-Engine Detection Pipeline',
    summary: 'How Deterministic Rules, Statistical Baselines, and ML Isolation Forest collaborate.',
    content: `To ensure maximum coverage without drowning analysts in false alarms, ICS-SHIELD employs a three-tier detection strategy:

1. Tier 1: Deterministic Rules Engine
   Evaluates known attack signatures with sub-millisecond latency. Detects hard protocol violations such as invalid function codes, blacklisted source IPs, or key-switch shifts.

2. Tier 2: Behavioral Anomaly Engine
   Calculates running statistical baselines across clean operational periods. Measures mean and standard deviation to compute Z-scores (Z = (X - μ) / σ). Flags rate anomalies when Z > 3.0.

3. Tier 3: Machine Learning Engine (Isolation Forest)
   Evaluates multivariate process and network vectors simultaneously. Detects coordinated low-and-slow attacks where individual metrics remain within loose thresholds but together exhibit anomalous patterns.`,
    codeSnippet: `# Isolation Forest Anomaly Scoring (detection-engine/ml):
model = IsolationForest(contamination=0.01, random_state=1337)
anomaly_score = -model.decision_function(features)[0]
# Calibrated to 0.0 - 1.0 confidence score
confidence = 1.0 / (1.0 + np.exp(-10 * (anomaly_score - 0.5)))`
  },
  {
    id: 'simulation',
    category: 'Simulation',
    title: 'Laboratory Attack Simulator & Story Mode',
    summary: '12 controlled attack scenarios, Master Story Mode, and air-gapped safety guarantees.',
    content: `The ICS-SHIELD laboratory simulator allows security analysts and students to experience realistic industrial cyber incidents in a completely safe, air-gapped environment.

Key Scenarios Include:
- SIM-MODBUS-RATE-001: Abnormal Modbus polling request rate spike (DoS).
- SIM-MODBUS-WRITE-001: Unexpected Modbus write single coil operation (T0855).
- SIM-UNKNOWN-ASSET-001: Unregistered rogue device appearance in OT network graph (T0886).
- SIM-COMM-PAIR-001: Unapproved communication pair between Engineering Workstation and safety PLC.
- SIM-DEVICE-OFFLINE-001: Controller heartbeat drop simulating field device outage (T0826).
- SIM-PROCESS-ANOMALY-001: Water storage tank pressure override perturbation beyond 8.5 bar safety limit (T0836).
- SIM-MULTISTAGE-001: Full 5-phase multi-stage cyber incident covering rogue connection, burst, unauthorized write, and pressure drift.

Master Story Mode provides a guided 13-stage walkthrough demonstrating the complete closed-loop defensive chain from Normal Operation to Incident Resolution.`,
    codeSnippet: `# Running automated 18-stage E2E simulation test:
node tests/e2e/test_master_simulation_story.js
# Expected Output:
# [✓ PASSED] Master 18-Stage Simulation E2E Test (100% Success Rate)`
  },
  {
    id: 'troubleshooting',
    category: 'Operations',
    title: 'Troubleshooting & Common FAQs',
    summary: 'Resolving port collisions, database fallback mode, and Docker prerequisites.',
    content: `Frequently Asked Questions and Solutions:

Q: What should I do if port 5050 or 3050 is already in use?
A: ICS-SHIELD's automated launcher (python run.py) and desktop app automatically detect occupied ports and terminate stale orphan processes. If running manually, execute:
kill -9 $(lsof -t -i:5050 -i:3050)

Q: Can ICS-SHIELD run without Docker Desktop installed?
A: Yes! When Docker is not detected, ICS-SHIELD operates in Standalone Desktop Mode, utilizing an in-memory/SQLite baseline store with built-in scenario fixtures. Full multi-container features (custom MySQL persistence, air-gapped internal Docker networks) activate automatically when Docker Desktop is running.

Q: What are the default login credentials?
A: SOC Analyst: username 'soc_analyst', password 'password123'.
Administrator: username 'admin', password 'admin123'.

Q: Does ICS-SHIELD send packets to real physical OT equipment?
A: Absolutely not. ICS-SHIELD enforces strict air-gapped laboratory safety guards. All synthetic attacks and simulated response playbooks are contained within the virtual laboratory digital twin.`,
    codeSnippet: `# Manual port check command:
lsof -i :5050 -i :3050
# Clean restart with python launcher:
python run.py`
  }
];
