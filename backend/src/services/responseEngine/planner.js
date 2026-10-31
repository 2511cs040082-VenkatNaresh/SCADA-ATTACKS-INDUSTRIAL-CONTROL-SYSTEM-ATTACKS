import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import { getPlaybooks } from './playbookManager.js';

export async function generateRecommendationsForIncident(incident, alert = null, mitreMapping = null) {
  const recommendations = [];
  const playbooks = await getPlaybooks();

  const title = incident.title || alert?.title || 'Suspicious Industrial Activity';
  const incidentCategory = (incident.category || 'MODBUS_OVERRIDE').toUpperCase();

  // Match Playbook 1: Modbus Write / Override
  if (incidentCategory.includes('MODBUS') || title.includes('Modbus') || (mitreMapping && mitreMapping.technique_external_id === 'T0855')) {
    const pb = playbooks.find(p => p.category === 'MODBUS') || playbooks[0];
    recommendations.push({
      recommendation_uuid: `rec-modbus-${Date.now()}`,
      incident_id: incident.id,
      alert_id: alert?.id || null,
      technique_id: 'T0855',
      recommendation_type: 'CONTAINMENT',
      title: 'Recommend Simulated Modbus Communication Isolation',
      description: 'Isolate target PLC communication in laboratory simulation following unauthorized Modbus write coil attempt.',
      reason: `Unexpected Modbus write activity was observed on asset #${incident.source_asset_id || 1}. The affected asset is part of the simulated control network. The recommended action is evidence collection followed by simulated communication isolation pending analyst approval.`,
      priority: 'P1',
      risk_level: 'HIGH_RISK',
      confidence: 0.92,
      recommended_playbook_id: pb.id,
      expected_effect: 'Simulated communication isolation will change the target PLC laboratory state from CONNECTED to SIMULATED_ISOLATED.',
      rollback_supported: true,
      requires_approval: true
    });
  }

  // Match Playbook 2: Network / Cross-Zone Communication
  if (incidentCategory.includes('NETWORK') || incidentCategory.includes('LATERAL') || title.includes('Lateral') || (mitreMapping && mitreMapping.technique_external_id === 'T0886')) {
    const pb = playbooks.find(p => p.category === 'NETWORK') || playbooks[1];
    recommendations.push({
      recommendation_uuid: `rec-net-${Date.now()}`,
      incident_id: incident.id,
      alert_id: alert?.id || null,
      technique_id: 'T0886',
      recommendation_type: 'CONTAINMENT',
      title: 'Recommend Simulated Cross-Zone Block',
      description: 'Block unapproved flow sequence between field device and engineering subnet in laboratory simulation.',
      reason: `Unapproved protocol session detected between workstation and controller. Recommended action is simulated communication quarantine.`,
      priority: 'P2',
      risk_level: 'MEDIUM_RISK',
      confidence: 0.88,
      recommended_playbook_id: pb.id,
      expected_effect: 'Simulated communication block will restrict flow sequence on target lab device.',
      rollback_supported: true,
      requires_approval: true
    });
  }

  // Match Playbook 4: Process Anomaly
  if (incidentCategory.includes('PROCESS') || title.includes('Parameter') || title.includes('Sensor') || (mitreMapping && mitreMapping.technique_external_id === 'T0836')) {
    const pb = playbooks.find(p => p.category === 'PROCESS') || playbooks[3];
    recommendations.push({
      recommendation_uuid: `rec-proc-${Date.now()}`,
      incident_id: incident.id,
      alert_id: alert?.id || null,
      technique_id: 'T0836',
      recommendation_type: 'MITIGATION',
      title: 'Recommend Simulated Process Safe-State Transition',
      description: 'Transition simulated process model to SAFE_STATE following sensor deviation.',
      reason: `Z-score anomaly threshold breached on sensor telemetry. Recommended action is transitioning simulated process to SAFE_STATE.`,
      priority: 'P1',
      risk_level: 'HIGH_RISK',
      confidence: 0.90,
      recommended_playbook_id: pb.id,
      expected_effect: 'Process model in laboratory simulator will enter SAFE_STATE to prevent simulated overpressure.',
      rollback_supported: true,
      requires_approval: true
    });
  }

  // Default fallback recommendation if none matched
  if (recommendations.length === 0) {
    const pb = playbooks[0];
    recommendations.push({
      recommendation_uuid: `rec-gen-${Date.now()}`,
      incident_id: incident.id,
      alert_id: alert?.id || null,
      technique_id: 'T0855',
      recommendation_type: 'INVESTIGATION',
      title: 'Recommend Asset Snapshot & Investigation Task',
      description: 'Snapshot asset state and create investigation task for assigned SOC analyst.',
      reason: `Security alert triggered for incident INC-${incident.id}. Recommended immediate evidence collection.`,
      priority: 'P2',
      risk_level: 'LOW_RISK',
      confidence: 0.85,
      recommended_playbook_id: pb.id,
      expected_effect: 'Asset snapshot recorded and task created in case workspace.',
      rollback_supported: true,
      requires_approval: false
    });
  }

  return recommendations;
}
