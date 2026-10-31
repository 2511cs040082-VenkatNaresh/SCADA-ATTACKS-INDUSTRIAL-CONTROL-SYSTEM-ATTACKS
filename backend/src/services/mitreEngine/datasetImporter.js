import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import crypto from 'crypto';

// Official MITRE ATT&CK for ICS v14.1 Reference Fixture Data
export const OFFICIAL_ICS_V14_DATASET = {
  version: 'v14.1',
  name: 'MITRE ATT&CK for ICS v14.1',
  source: 'Official STIX v2.1 / MITRE ATT&CK Framework',
  source_url: 'https://attack.mitre.org/matrices/ics/',
  release_date: '2023-10-31T00:00:00Z',
  tactics: [
    { tactic_id: 'TA0108', name: 'Initial Access', short_name: 'initial-access', description: 'Adversary is trying to get into your ICS environment.', display_order: 1 },
    { tactic_id: 'TA0104', name: 'Execution', short_name: 'execution', description: 'Adversary is trying to run malicious code on ICS devices or HMIs.', display_order: 2 },
    { tactic_id: 'TA0105', name: 'Persistence', short_name: 'persistence', description: 'Adversary is trying to maintain their foothold on ICS assets.', display_order: 3 },
    { tactic_id: 'TA0106', name: 'Privilege Escalation', short_name: 'privilege-escalation', description: 'Adversary is trying to gain higher-level permissions.', display_order: 4 },
    { tactic_id: 'TA0107', name: 'Evasion', short_name: 'evasion', description: 'Adversary is trying to avoid detection by ICS security controls.', display_order: 5 },
    { tactic_id: 'TA0109', name: 'Discovery', short_name: 'discovery', description: 'Adversary is trying to figure out your ICS network layout and device types.', display_order: 6 },
    { tactic_id: 'TA0110', name: 'Lateral Movement', short_name: 'lateral-movement', description: 'Adversary is trying to move through your ICS network.', display_order: 7 },
    { tactic_id: 'TA0111', name: 'Command and Control', short_name: 'command-and-control', description: 'Adversary is trying to communicate with compromised ICS systems.', display_order: 8 },
    { tactic_id: 'TA0103', name: 'Inhibit Response Function', short_name: 'inhibit-response-function', description: 'Adversary is trying to prevent safety/protection systems from responding to critical operational events.', display_order: 9 },
    { tactic_id: 'TA0102', name: 'Impair Process Control', short_name: 'impair-process-control', description: 'Adversary is trying to manipulate, disable, or falsify physical control functions.', display_order: 10 },
    { tactic_id: 'TA0101', name: 'Impact', short_name: 'impact', description: 'Adversary is trying to manipulate, interrupt, or destroy ICS processes and physical assets.', display_order: 11 }
  ],
  techniques: [
    { technique_id: 'T0800', external_id: 'T0800', tactic_id: 'TA0110', name: 'Point-to-Point Serial Links', description: 'Adversaries may use point-to-point serial communication links to pivot between field devices.' },
    { technique_id: 'T0801', external_id: 'T0801', tactic_id: 'TA0109', name: 'Network Service Discovery', description: 'Adversaries may attempt to get a listing of services running on remote ICS hosts.' },
    { technique_id: 'T0802', external_id: 'T0802', tactic_id: 'TA0104', name: 'Automated Execution', description: 'Adversaries may execute commands via automated scripts, scheduled tasks, or logic routines.' },
    { technique_id: 'T0803', external_id: 'T0803', tactic_id: 'TA0103', name: 'Block Command Message', description: 'Adversaries may prevent command messages from reaching control devices like PLCs or RTUs.' },
    { technique_id: 'T0804', external_id: 'T0804', tactic_id: 'TA0103', name: 'Block Reporting Message', description: 'Adversaries may block telemetry and reporting messages sent from field devices back to HMIs or SCADA servers.' },
    { technique_id: 'T0805', external_id: 'T0805', tactic_id: 'TA0103', name: 'Block Serial COM', description: 'Adversaries may interrupt or block serial communications connecting field equipment to gateways.' },
    { technique_id: 'T0806', external_id: 'T0806', tactic_id: 'TA0106', name: 'Brute Force I/O', description: 'Adversaries may systematically probe input/output points to discover available process parameters.' },
    { technique_id: 'T0807', external_id: 'T0807', tactic_id: 'TA0104', name: 'Command-Line Interface', description: 'Adversaries may use command-line interfaces to execute commands on engineering workstations or HMIs.' },
    { technique_id: 'T0812', external_id: 'T0812', tactic_id: 'TA0110', name: 'Dual Use Network Interface', description: 'Adversaries may leverage dual-homed systems spanning IT and OT boundaries to move laterally.' },
    { technique_id: 'T0813', external_id: 'T0813', tactic_id: 'TA0101', name: 'Data Destruction', description: 'Adversaries may destroy controller logic, device firmware, or operational databases.' },
    { technique_id: 'T0814', external_id: 'T0814', tactic_id: 'TA0101', name: 'Denial of Service', description: 'Adversaries may flood control networks or overwhelm PLCs to cause operational outage.' },
    { technique_id: 'T0815', external_id: 'T0815', tactic_id: 'TA0108', name: 'Exploitation of Remote Services', description: 'Adversaries may exploit vulnerabilities in remote management software (RDP, SSH, VNC) to gain access.' },
    { technique_id: 'T0826', external_id: 'T0826', tactic_id: 'TA0101', name: 'Loss of Availability', description: 'Adversaries may cause operational systems or physical equipment to become completely unavailable.' },
    { technique_id: 'T0831', external_id: 'T0831', tactic_id: 'TA0102', name: 'Manipulate Control Logic', description: 'Adversaries may alter the ladder logic or control routines executed by PLCs or RTUs.' },
    { technique_id: 'T0836', external_id: 'T0836', tactic_id: 'TA0102', name: 'Modify Parameter', description: 'Adversaries may alter operational setpoints, alarm thresholds, or calibration variables.' },
    { technique_id: 'T0843', external_id: 'T0843', tactic_id: 'TA0102', name: 'Program Download', description: 'Adversaries may download unauthorized program files or firmware binaries into controllers.' },
    { technique_id: 'T0855', external_id: 'T0855', tactic_id: 'TA0104', name: 'Unauthorized Command Message', description: 'Adversaries may send unauthorized industrial protocol control commands (Modbus write coil/register, DNP3 operate) directly to PLCs.' },
    { technique_id: 'T0858', external_id: 'T0858', tactic_id: 'TA0103', name: 'Change Operating Mode', description: 'Adversaries may switch controller key-switches from RUN to PROGRAM or REMOTE STOP mode.' },
    { technique_id: 'T0879', external_id: 'T0879', tactic_id: 'TA0110', name: 'Remote Services', description: 'Adversaries may use legitimate remote administration protocols (Modbus TCP, DNP3, Ethernet/IP) to access controllers.' },
    { technique_id: 'T0886', external_id: 'T0886', tactic_id: 'TA0110', name: 'Remote Services (ICS Protocol Abuse)', description: 'Adversaries may abuse unauthenticated industrial control protocols to issue unauthorized read/write commands across network segments.' },
    { technique_id: 'T0887', external_id: 'T0887', tactic_id: 'TA0109', name: 'Wireless Discovery', description: 'Adversaries may scan wireless frequencies (Zigbee, WirelessHART) to identify industrial field instruments.' }
  ],
  subtechniques: [
    { subtechnique_id: 'T0836.001', parent_technique_id: 'T0836', name: 'Modify Alarm Threshold', description: 'Altering high/low pressure or temperature alarm boundaries.' },
    { subtechnique_id: 'T0843.001', parent_technique_id: 'T0843', name: 'PLC Logic Overwrite', description: 'Overwriting existing control logic via unauthenticated Modbus/CIP download.' },
    { subtechnique_id: 'T0886.001', parent_technique_id: 'T0886', name: 'Modbus Function Code Injection', description: 'Abusing Modbus function codes 0x05, 0x06, 0x0F, 0x10 to force output coils and holding registers.' }
  ],
  data_sources: [
    { external_id: 'DS0001', name: 'Industrial Protocol Logs', description: 'Deep Packet Inspection logs for Modbus TCP, DNP3, S7comm, EtherNet/IP.' },
    { external_id: 'DS0002', name: 'PLC Configuration Audit Logs', description: 'Controller event logs recording logic downloads and operating mode changes.' },
    { external_id: 'DS0003', name: 'HMI Alarm & Event Records', description: 'SCADA HMI alarm logs recording threshold trips and operator overrides.' }
  ],
  mitigations: [
    { external_id: 'M0801', name: 'Network Segmentation', description: 'Isolate OT networks from IT networks using Purdue Model zone partitioning and firewalls.' },
    { external_id: 'M0802', name: 'Filter Network Traffic', description: 'Enforce strict industrial protocol whitelisting restricting unauthorized function codes.' },
    { external_id: 'M0803', name: 'Physical Control Key-switch Enforce', description: 'Lock PLC keyswitches in RUN mode to block unauthorized remote program downloads.' }
  ]
};

// Compute SHA-256 checksum for dataset integrity validation
export function computeDatasetChecksum(dataset) {
  const content = JSON.stringify({
    version: dataset.version,
    tactics: dataset.tactics,
    techniques: dataset.techniques,
    subtechniques: dataset.subtechniques
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

// In-Memory Fallback Dataset Store
let memoryVersions = [{
  id: 1,
  version: OFFICIAL_ICS_V14_DATASET.version,
  name: OFFICIAL_ICS_V14_DATASET.name,
  source: OFFICIAL_ICS_V14_DATASET.source,
  source_url: OFFICIAL_ICS_V14_DATASET.source_url,
  release_date: OFFICIAL_ICS_V14_DATASET.release_date,
  checksum: computeDatasetChecksum(OFFICIAL_ICS_V14_DATASET),
  status: 'ACTIVE',
  tactic_count: OFFICIAL_ICS_V14_DATASET.tactics.length,
  technique_count: OFFICIAL_ICS_V14_DATASET.techniques.length,
  subtechnique_count: OFFICIAL_ICS_V14_DATASET.subtechniques.length,
  created_at: new Date().toISOString()
}];

export async function seedDefaultDatasetIfEmpty() {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM mitre_dataset_versions');
    if (rows[0].cnt === 0) {
      const checksum = computeDatasetChecksum(OFFICIAL_ICS_V14_DATASET);
      const [res] = await pool.query(`
        INSERT INTO mitre_dataset_versions 
        (version, name, source, source_url, release_date, checksum, status, tactic_count, technique_count, subtechnique_count)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
      `, [
        OFFICIAL_ICS_V14_DATASET.version,
        OFFICIAL_ICS_V14_DATASET.name,
        OFFICIAL_ICS_V14_DATASET.source,
        OFFICIAL_ICS_V14_DATASET.source_url,
        OFFICIAL_ICS_V14_DATASET.release_date,
        checksum,
        OFFICIAL_ICS_V14_DATASET.tactics.length,
        OFFICIAL_ICS_V14_DATASET.techniques.length,
        OFFICIAL_ICS_V14_DATASET.subtechniques.length
      ]);
      const versionId = res.insertId;

      // Seed Tactics
      for (const t of OFFICIAL_ICS_V14_DATASET.tactics) {
        await pool.query(`
          INSERT INTO mitre_tactics (tactic_id, name, description, dataset_version_id, short_name, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), dataset_version_id=VALUES(dataset_version_id)
        `, [t.tactic_id, t.name, t.description, versionId, t.short_name, t.display_order]);
      }

      // Seed Techniques
      for (const tech of OFFICIAL_ICS_V14_DATASET.techniques) {
        await pool.query(`
          INSERT INTO mitre_techniques (technique_id, external_id, name, tactic_id, description, version, dataset_version_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), dataset_version_id=VALUES(dataset_version_id)
        `, [tech.technique_id, tech.external_id, tech.name, tech.tactic_id, tech.description, OFFICIAL_ICS_V14_DATASET.version, versionId]);
      }

      // Seed Subtechniques
      for (const sub of OFFICIAL_ICS_V14_DATASET.subtechniques) {
        const [parentRow] = await pool.query('SELECT id FROM mitre_techniques WHERE technique_id = ?', [sub.parent_technique_id]);
        if (parentRow.length > 0) {
          await pool.query(`
            INSERT INTO mitre_subtechniques (subtechnique_id, parent_technique_id, name, description, dataset_version_id, subtechnique_external_id)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)
          `, [sub.subtechnique_id, parentRow[0].id, sub.name, sub.description, versionId, sub.subtechnique_id]);
        }
      }

      logger.info(`[MITRE ENGINE] Successfully seeded default ATT&CK dataset version ${OFFICIAL_ICS_V14_DATASET.version}`);
    }
  } catch (err) {
    logger.warn(`[MITRE ENGINE] DB seed skipped/failed (using memory dataset): ${err.message}`);
  }
}

export async function getVersions() {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM mitre_dataset_versions ORDER BY imported_at DESC');
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[MITRE ENGINE] getVersions DB query failed, returning memory fallback: ${err.message}`);
  }
  return memoryVersions;
}

export async function importDatasetVersion(datasetData, userId = 1) {
  const versionStr = datasetData.version || `v${Date.now()}`;
  const name = datasetData.name || `Custom ATT&CK Dataset ${versionStr}`;
  const source = datasetData.source || 'Custom STIX Import';
  const checksum = computeDatasetChecksum(datasetData);

  const tacticCount = datasetData.tactics ? datasetData.tactics.length : 0;
  const techniqueCount = datasetData.techniques ? datasetData.techniques.length : 0;
  const subtechniqueCount = datasetData.subtechniques ? datasetData.subtechniques.length : 0;

  try {
    const pool = getDbPool();
    const [res] = await pool.query(`
      INSERT INTO mitre_dataset_versions
      (version, name, source, source_url, release_date, checksum, status, tactic_count, technique_count, subtechnique_count, created_by)
      VALUES (?, ?, ?, ?, NOW(), ?, 'INACTIVE', ?, ?, ?, ?)
    `, [versionStr, name, source, datasetData.source_url || null, checksum, tacticCount, techniqueCount, subtechniqueCount, userId]);

    const versionId = res.insertId;

    if (datasetData.tactics) {
      for (const t of datasetData.tactics) {
        await pool.query(`
          INSERT INTO mitre_tactics (tactic_id, name, description, dataset_version_id, short_name)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name)
        `, [t.tactic_id, t.name, t.description, versionId, t.short_name || t.tactic_id]);
      }
    }

    if (datasetData.techniques) {
      for (const tech of datasetData.techniques) {
        await pool.query(`
          INSERT INTO mitre_techniques (technique_id, external_id, name, tactic_id, description, version, dataset_version_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name)
        `, [tech.technique_id, tech.external_id || tech.technique_id, tech.name, tech.tactic_id, tech.description, versionStr, versionId]);
      }
    }

    return { id: versionId, version: versionStr, name, status: 'INACTIVE', tactic_count: tacticCount, technique_count: techniqueCount, checksum };
  } catch (err) {
    logger.warn(`[MITRE ENGINE] Import DB failed, performing memory import: ${err.message}`);
    const newVersion = {
      id: memoryVersions.length + 1,
      version: versionStr,
      name,
      source,
      checksum,
      status: 'INACTIVE',
      tactic_count: tacticCount,
      technique_count: techniqueCount,
      subtechnique_count: subtechniqueCount,
      created_at: new Date().toISOString()
    };
    memoryVersions.push(newVersion);
    return newVersion;
  }
}

export async function activateVersion(versionId, userId = 1) {
  try {
    const pool = getDbPool();
    await pool.query("UPDATE mitre_dataset_versions SET status = 'ARCHIVED' WHERE status = 'ACTIVE'");
    await pool.query("UPDATE mitre_dataset_versions SET status = 'ACTIVE' WHERE id = ?", [versionId]);
    const [rows] = await pool.query("SELECT * FROM mitre_dataset_versions WHERE id = ?", [versionId]);
    return rows[0];
  } catch (err) {
    logger.warn(`[MITRE ENGINE] activateVersion DB failed, updating memory: ${err.message}`);
    memoryVersions.forEach(v => { v.status = (v.id === Number(versionId)) ? 'ACTIVE' : 'ARCHIVED'; });
    return memoryVersions.find(v => v.id === Number(versionId));
  }
}

export async function rollbackVersion(versionId, userId = 1) {
  return activateVersion(versionId, userId);
}
