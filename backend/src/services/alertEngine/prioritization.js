/**
 * Calculates severity and priority for a normalized detection alert.
 * 
 * Severity: CRITICAL, HIGH, MEDIUM, LOW
 * Priority: P1, P2, P3, P4
 */

export function calculateSeverityAndPriority(input) {
  const {
    base_severity = 'MEDIUM',
    confidence = 0.8,
    asset_criticality = 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
    occurrence_count = 1,
    anomaly_score = 50.0,
    has_process_impact = false
  } = input;

  let severityScore = 50.0;

  // Base severity weighting
  if (base_severity === 'CRITICAL') severityScore += 40.0;
  else if (base_severity === 'HIGH') severityScore += 25.0;
  else if (base_severity === 'MEDIUM') severityScore += 10.0;

  // Asset criticality weighting
  if (asset_criticality === 'CRITICAL') severityScore += 20.0;
  else if (asset_criticality === 'HIGH') severityScore += 10.0;
  else if (asset_criticality === 'LOW') severityScore -= 10.0;

  // Process impact weighting
  if (has_process_impact) severityScore += 15.0;

  // Anomaly score boost
  if (anomaly_score >= 80.0) severityScore += 15.0;

  // Determine Severity
  let finalSeverity = 'MEDIUM';
  if (severityScore >= 85.0) finalSeverity = 'CRITICAL';
  else if (severityScore >= 65.0) finalSeverity = 'HIGH';
  else if (severityScore >= 40.0) finalSeverity = 'MEDIUM';
  else finalSeverity = 'LOW';

  // Priority mapping separate from severity
  let finalPriority = 'P3';
  if (finalSeverity === 'CRITICAL' && (asset_criticality === 'CRITICAL' || has_process_impact || confidence > 0.85)) {
    finalPriority = 'P1'; // Immediate analyst attention required
  } else if (finalSeverity === 'CRITICAL' || finalSeverity === 'HIGH') {
    finalPriority = 'P2'; // High priority
  } else if (finalSeverity === 'MEDIUM') {
    finalPriority = 'P3'; // Standard investigation
  } else {
    finalPriority = 'P4'; // Low priority / informational
  }

  // Boost priority if high occurrence rate
  if (occurrence_count > 10 && finalPriority === 'P3') {
    finalPriority = 'P2';
  }

  return {
    severity: finalSeverity,
    priority: finalPriority,
    calculated_risk_score: Math.min(100.0, Math.max(0.0, severityScore))
  };
}
