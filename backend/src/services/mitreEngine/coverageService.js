import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import { OFFICIAL_ICS_V14_DATASET } from './datasetImporter.js';
import { getAllMappings } from './mappingService.js';

export async function calculateCoverageMetrics() {
  try {
    const mappings = await getAllMappings();

    const allTactics = OFFICIAL_ICS_V14_DATASET.tactics;
    const allTechniques = OFFICIAL_ICS_V14_DATASET.techniques;

    // Group mappings by technique_external_id
    const techniqueMap = {};
    allTechniques.forEach(t => {
      techniqueMap[t.external_id] = {
        technique_id: t.technique_id,
        external_id: t.external_id,
        name: t.name,
        tactic_id: t.tactic_id,
        status: 'UNMAPPED',
        confirmed_count: 0,
        suggested_count: 0,
        sources: new Set()
      };
    });

    const sourceDistribution = {
      RULE_DETECTION: 0,
      BEHAVIORAL_ANOMALY: 0,
      ML_ANOMALY: 0,
      ALERT: 0,
      INCIDENT: 0
    };

    mappings.forEach(m => {
      const techId = m.technique_external_id;
      if (sourceDistribution[m.source_type] !== undefined) {
        sourceDistribution[m.source_type]++;
      }

      if (techniqueMap[techId]) {
        techniqueMap[techId].sources.add(m.source_type);
        if (m.mapping_status === 'ANALYST_CONFIRMED') {
          techniqueMap[techId].confirmed_count++;
          techniqueMap[techId].status = 'CONFIRMED';
        } else if (m.mapping_status === 'AUTO_SUGGESTED' && techniqueMap[techId].status !== 'CONFIRMED') {
          techniqueMap[techId].suggested_count++;
          techniqueMap[techId].status = 'SUGGESTED';
        }
      }
    });

    // Compute Tactic Breakdown
    const tacticBreakdown = allTactics.map(tactic => {
      const tacticTechs = Object.values(techniqueMap).filter(t => t.tactic_id === tactic.tactic_id);
      const mappedTechs = tacticTechs.filter(t => t.status !== 'UNMAPPED');
      const confirmedTechs = tacticTechs.filter(t => t.status === 'CONFIRMED');

      return {
        tactic_id: tactic.tactic_id,
        name: tactic.name,
        short_name: tactic.short_name,
        display_order: tactic.display_order,
        total_techniques: tacticTechs.length,
        mapped_techniques: mappedTechs.length,
        confirmed_techniques: confirmedTechs.length,
        coverage_percent: tacticTechs.length > 0 ? Math.round((mappedTechs.length / tacticTechs.length) * 100) : 0,
        techniques: tacticTechs.map(tech => ({
          external_id: tech.external_id,
          name: tech.name,
          status: tech.status,
          sources: Array.from(tech.sources)
        }))
      };
    });

    const totalTechniques = allTechniques.length;
    const confirmedCount = Object.values(techniqueMap).filter(t => t.status === 'CONFIRMED').length;
    const suggestedCount = Object.values(techniqueMap).filter(t => t.status === 'SUGGESTED').length;
    const unmappedCount = totalTechniques - (confirmedCount + suggestedCount);

    const coveredTacticsCount = tacticBreakdown.filter(t => t.mapped_techniques > 0).length;
    const totalTacticsCount = allTactics.length;

    return {
      tactic_summary: {
        total_tactics: totalTacticsCount,
        covered_tactics: coveredTacticsCount,
        coverage_percent: Math.round((coveredTacticsCount / totalTacticsCount) * 100)
      },
      technique_summary: {
        total_techniques: totalTechniques,
        confirmed: confirmedCount,
        suggested: suggestedCount,
        unmapped: unmappedCount
      },
      source_distribution: sourceDistribution,
      tactic_breakdown: tacticBreakdown,
      calculated_at: new Date().toISOString()
    };
  } catch (err) {
    logger.error(`[MITRE COVERAGE] Failed to calculate coverage metrics: ${err.message}`);
    throw err;
  }
}
