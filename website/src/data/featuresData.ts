export interface FeatureItem {
  id: string;
  number: number;
  title: string;
  category: 'MONITORING' | 'DETECTION' | 'RESPONSE' | 'SIMULATION' | 'OPERATIONS';
  shortDesc: string;
  fullDesc: string;
  protocols: string[];
  modulePath: string;
  keyCapabilities: string[];
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: 'scada-monitoring',
    number: 1,
    title: 'Real-Time SCADA Monitoring',
    category: 'MONITORING',
    shortDesc: 'Physical process telemetry monitoring for liquid storage, header pressure, and temperature loops.',
    fullDesc: 'Monitors real-time physical SCADA processes including storage tank levels, fluid pressures, thermal dynamics, and pump flow rates across Purdue Model Levels 0 to 2.',
    protocols: ['Analog Telemetry', 'Digital IO', 'Sensor Bus'],
    modulePath: 'frontend/src/pages/Process.tsx & telemetry/',
    keyCapabilities: [
      'Live water treatment process loop tracking',
      'Tank level, pressure, temperature & flow rate telemetry',
      'Engineering unit validation and boundary range verification',
      'Dynamic baseline tracking under normal operating conditions'
    ]
  },
  {
    id: 'protocol-monitoring',
    number: 2,
    title: 'Industrial Protocol Monitoring',
    category: 'MONITORING',
    shortDesc: 'Deep packet inspection (DPI) and transaction tracking across industrial fieldbus and ethernet protocols.',
    fullDesc: 'Passively monitors, parses, and validates industrial control system communications with deep packet inspection across Modbus TCP, DNP3, and Siemens S7comm.',
    protocols: ['Modbus TCP', 'DNP3', 'S7comm', 'EtherNet/IP'],
    modulePath: 'network_monitor/ & backend/src/services/networkMonitoring.service.js',
    keyCapabilities: [
      'Continuous OT network packet capture and flow extraction',
      'Bidirectional session tracking between HMIs, PLCs, and RTUs',
      'Transaction completion latency and packet-per-second monitoring',
      'Zero active scanning impact on delicate legacy field equipment'
    ]
  },
  {
    id: 'modbus-detection',
    number: 3,
    title: 'Modbus TCP Anomaly Detection',
    category: 'DETECTION',
    shortDesc: 'Detection of unauthorized function codes, register address boundary violations, and write bursts.',
    fullDesc: 'Specialized inspection engine for Modbus TCP (Port 502). Flags unexpected function codes (FC05/FC06/FC15/FC16), unauthorized coil overrides, and register read bursts.',
    protocols: ['Modbus TCP (Port 502)'],
    modulePath: 'backend/src/services/detectionEngine.service.js',
    keyCapabilities: [
      'Function Code (FC) whitelist and permission checking',
      'Unauthorized single/multiple coil write detection (FC05/FC15)',
      'Holding register perturbation and boundary overflow checks',
      'Modbus exception response burst analysis (Code 0x02 Illegal Address)'
    ]
  },
  {
    id: 'dnp3-monitoring',
    number: 4,
    title: 'DNP3 Protocol Monitoring',
    category: 'MONITORING',
    shortDesc: 'Outstation communication analysis, unsolicited response tracking, and control command validation.',
    fullDesc: 'Monitors Distributed Network Protocol (DNP3) outstation and master communications, tracking object groups, variation flags, and unsolicited status reporting.',
    protocols: ['DNP3 (Port 20000)'],
    modulePath: 'network_monitor/protocols/dnp3_parser.py',
    keyCapabilities: [
      'DNP3 Master-Outstation polling session tracking',
      'Binary input and analog input variation validation',
      'Unsolicited response storm detection',
      'Control relay output block (CROB) command audit logging'
    ]
  },
  {
    id: 's7comm-monitoring',
    number: 5,
    title: 'S7comm Protocol Monitoring',
    category: 'MONITORING',
    shortDesc: 'Inspection of Siemens S7 PLC communications and operating mode change detection.',
    fullDesc: 'Inspects proprietary Siemens S7comm frames over ISO-on-TCP (Port 102). Detects unauthorized PLC key-switch operating mode transitions (RUN to STOP/PROGRAM).',
    protocols: ['S7comm / ISO-on-TCP (Port 102)'],
    modulePath: 'network_monitor/protocols/s7_parser.py',
    keyCapabilities: [
      'ISO-on-TCP (RFC 1006) protocol validation',
      'PLC operating mode transition alerts (RUN ➔ STOP / PROGRAM)',
      'Data block (DB) read/write access monitoring',
      'CPU diagnostic buffer query monitoring'
    ]
  },
  {
    id: 'rule-based-detection',
    number: 6,
    title: 'Rule-Based Attack Detection',
    category: 'DETECTION',
    shortDesc: 'Deterministic rules engine evaluating OT network events with sub-millisecond latency.',
    fullDesc: 'High-speed deterministic pattern matching engine executing strict industrial security rules against real-time network and telemetry events with zero false-alarm drift.',
    protocols: ['All Supported OT Protocols'],
    modulePath: 'detection-engine/rules/ & backend/src/services/detectionEngine.service.js',
    keyCapabilities: [
      'Sub-millisecond rule matching across live telemetry feeds',
      'Deterministic signature detection for known SCADA attack techniques',
      'Dynamic threshold rules for command rate, payload size, and frequency',
      'Cryptographically hashed rule definitions with version control'
    ]
  },
  {
    id: 'behavioral-anomaly',
    number: 7,
    title: 'Behavioral Anomaly Detection',
    category: 'DETECTION',
    shortDesc: 'Statistical baseline profiling and dynamic Z-score anomaly identification.',
    fullDesc: 'Profiles normal communication frequencies, packet intervals, and command distributions. Identifies deviations using statistical Z-score calculations beyond standard limits.',
    protocols: ['Modbus TCP', 'DNP3', 'System Events'],
    modulePath: 'detection-engine/behavioral/ & backend/src/services/behavioralEngine.service.js',
    keyCapabilities: [
      'Automated baseline calculation from historical clean periods',
      'Z-score deviation scoring for command rates and packet volumes',
      'Time-of-day behavioral shift detection',
      'Asset-specific baseline isolation preventing cross-domain noise'
    ]
  },
  {
    id: 'ml-detection',
    number: 8,
    title: 'Machine Learning Detection',
    category: 'DETECTION',
    shortDesc: 'Unsupervised Isolation Forest model detecting subtle zero-day OT perturbations.',
    fullDesc: 'Python-powered Isolation Forest machine learning pipeline that learns multidimensional normal process states and flags high-confidence multivariate anomalies.',
    protocols: ['FastAPI REST API', 'Scikit-Learn'],
    modulePath: 'detection-engine/ml/ & backend/src/services/mlEngine.service.js',
    keyCapabilities: [
      'Unsupervised Isolation Forest algorithm tailored for OT datasets',
      'Multivariate anomaly scoring combining sensor and network features',
      'Calibrated confidence scores (0.0 to 1.0) with model versioning',
      'Zero dependence on external internet or third-party cloud services'
    ]
  },
  {
    id: 'alert-correlation',
    number: 9,
    title: 'Real-Time Alert Correlation',
    category: 'DETECTION',
    shortDesc: 'Severity scoring, deduplication, and alert flood suppression for SOC analysts.',
    fullDesc: 'Aggregates detections from Rule, Behavioral, and ML engines into deduplicated, prioritized SOC alerts with automated flood suppression and SLA escalation.',
    protocols: ['WebSocket Bus', 'REST API'],
    modulePath: 'backend/src/services/alert.service.js & alertEngine/',
    keyCapabilities: [
      'Multi-engine detection correlation into unified alert records',
      'Intelligent alert deduplication and flood suppression during bursts',
      'Standardized severity scoring: CRITICAL, HIGH, MEDIUM, LOW',
      'Configurable SLA tracking with auto-escalation rules'
    ]
  },
  {
    id: 'incident-investigation',
    number: 10,
    title: 'Incident Investigation Workspace',
    category: 'OPERATIONS',
    shortDesc: 'Forensic case management with chronologically correlated evidence and investigation notes.',
    fullDesc: 'Full forensic investigation workspace where security analysts review correlated telemetry, examine raw packet evidence, maintain hypotheses, and document findings.',
    protocols: ['Forensic Audit Ledger'],
    modulePath: 'backend/src/services/incident.service.js & frontend/src/pages/IncidentDetail.tsx',
    keyCapabilities: [
      'Unified case management workspace (Purdue Level 0-3 context)',
      'Chronological forensic timeline from root event to mitigation',
      'SHA-256 evidence hashing guaranteeing data integrity',
      'Analyst collaboration notes, task checklists, and hypothesis tracking'
    ]
  },
  {
    id: 'mitre-ics',
    number: 11,
    title: 'MITRE ATT&CK for ICS Integration',
    category: 'DETECTION',
    shortDesc: 'Formal threat mapping to MITRE ATT&CK for ICS v14 matrix and coverage scoring.',
    fullDesc: 'Maps detections and alerts directly to MITRE ATT&CK for ICS tactics and techniques (e.g., T0855 Unauthorized Command Message, T0836 Modify Parameter, T0886 Remote Services).',
    protocols: ['MITRE ATT&CK for ICS v14'],
    modulePath: 'backend/src/services/mitre.service.js & mitreEngine/',
    keyCapabilities: [
      'Interactive MITRE ATT&CK for ICS 12-tactic matrix coverage',
      'Automated technique mapping for incoming security events',
      'Confidence-weighted tactic coverage analytics',
      'Actionable mitigation and countermeasure guidance per technique'
    ]
  },
  {
    id: 'response-recommendations',
    number: 12,
    title: 'Defensive Response Recommendations',
    category: 'RESPONSE',
    shortDesc: 'Automated playbook recommendations with mandatory human-in-the-loop authorization.',
    fullDesc: 'Generates defensive response recommendations (such as simulated port isolation, connection throttling, or baseline resets) requiring explicit analyst approval before execution.',
    protocols: ['Air-Gapped Lab Safety Controls'],
    modulePath: 'backend/src/services/response.service.js & responseEngine/',
    keyCapabilities: [
      'Context-aware playbook recommendation engine',
      'Strict Separation of Duties: Mandatory human authorization required',
      'Simulated port isolation and fail-safe process reset actions',
      'Rollback capability preserving operational continuity'
    ]
  },
  {
    id: 'simulation-lab',
    number: 13,
    title: 'Controlled Attack Simulation Laboratory',
    category: 'SIMULATION',
    shortDesc: 'Air-gapped laboratory simulator with 12 scenarios and Master Story Mode.',
    fullDesc: 'Isolated digital-twin simulation harness providing 12 controlled ICS attack scenarios (DDoS, MitM, unauthorized writes, sensor drift) and a 13-stage Master Story Mode.',
    protocols: ['Isolated Lab Harness', 'Virtual PLCs'],
    modulePath: 'backend/src/services/simulation.service.js & simulationEngine/',
    keyCapabilities: [
      '12 preconfigured industrial cyberattack scenarios',
      '13-stage Master Story Mode demonstrating the complete SOC lifecycle',
      'Strict air-gap safety guards preventing real physical hardware contact',
      'Automated Expected vs Observed evaluation matrix scoring'
    ]
  },
  {
    id: 'analytics-reports',
    number: 14,
    title: 'Security Analytics & Audit Reports',
    category: 'OPERATIONS',
    shortDesc: 'Forensic PDF and JSON executive audit report generation with cryptographic verification.',
    fullDesc: 'Generates compliance-ready executive summaries, technical incident post-mortems, and regulatory audit reports with SHA-256 digital signatures for chain-of-custody verification.',
    protocols: ['PDF Engine', 'JSON Export'],
    modulePath: 'backend/src/services/report.service.js & reportEngine/',
    keyCapabilities: [
      'Automated Executive Summary and Technical Incident PDF reports',
      'Cryptographic SHA-256 digital fingerprint on all exported artifacts',
      'Multi-domain trend analytics across assets, alerts, and protocols',
      'Full compliance audit trails preserving analyst actions'
    ]
  },
  {
    id: 'administration-center',
    number: 15,
    title: 'Administration & Configuration Center',
    category: 'OPERATIONS',
    shortDesc: 'Granular RBAC, session management, retention policies, and system health telemetry.',
    fullDesc: 'Comprehensive administrator control center allowing role assignment, session revocation, retention policy management, and component health monitoring through the UI.',
    protocols: ['JWT / RBAC', 'System Health Bus'],
    modulePath: 'backend/src/services/adminService/ & frontend/src/pages/Admin.tsx',
    keyCapabilities: [
      'Role-Based Access Control (Admin, Security Analyst, SOC Operator, Viewer)',
      'Active user session tracking and immediate session revocation',
      'Automated data retention and database pruning controls',
      'Subsystem health telemetry (Database pool, WebSocket, ML node)'
    ]
  },
  {
    id: 'docker-deployment',
    number: 16,
    title: 'Containerized Docker Deployment',
    category: 'OPERATIONS',
    shortDesc: 'Multi-stage Docker containers with production and air-gapped laboratory Compose profiles.',
    fullDesc: 'Hardened, multi-stage Docker container architecture featuring internal bridge networks, healthcheck probes, non-root user execution, and volume persistence.',
    protocols: ['Docker Compose v2', 'Linux Containers'],
    modulePath: 'docker-compose.yml & docker-compose.lab.yml',
    keyCapabilities: [
      'Production, development, and air-gapped lab Compose profiles',
      'Internal isolated bridge networks preventing unauthorized egress',
      'Automated database migration and healthcheck probe scripts',
      'Volume persistence for MySQL data, forensic audit logs, and reports'
    ]
  }
];
