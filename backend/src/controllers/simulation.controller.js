import * as simulationService from '../services/simulation.service.js';

export async function getStatus(_req, res, next) {
  try {
    const health = await simulationService.getSimulationHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
}

export async function getScenarios(req, res, next) {
  try {
    const filters = { category: req.query.category };
    const scenarios = await simulationService.getScenarios(filters);
    res.json({ success: true, count: scenarios.length, data: scenarios });
  } catch (err) {
    next(err);
  }
}

export async function getScenarioById(req, res, next) {
  try {
    const scenario = await simulationService.getScenarioById(req.params.id);
    if (!scenario) return res.status(404).json({ success: false, error: 'Scenario not found' });
    res.json({ success: true, data: scenario });
  } catch (err) {
    next(err);
  }
}

export async function validateScenario(req, res, next) {
  try {
    const validation = await simulationService.validateScenario(req.params.id);
    res.json({ success: true, data: validation });
  } catch (err) {
    next(err);
  }
}

export async function getSimulationRuns(req, res, next) {
  try {
    const filters = { status: req.query.status };
    const runs = await simulationService.getSimulationRuns(filters);
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    next(err);
  }
}

export async function getSimulationRunById(req, res, next) {
  try {
    const run = await simulationService.getSimulationRunById(req.params.id);
    if (!run) return res.status(404).json({ success: false, error: 'Simulation Run not found' });
    res.json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
}

export async function startSimulationRun(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const scenarioId = req.params.id || req.body.scenario_id || 'SIM-MULTISTAGE-001';
    const run = await simulationService.startSimulationRun(scenarioId, req.body, userId);
    res.status(201).json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
}

export async function pauseSimulation(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await simulationService.pauseSimulation(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resumeSimulation(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await simulationService.resumeSimulation(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stopSimulation(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await simulationService.stopSimulation(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function emergencyStop(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await simulationService.emergencyStop(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resetLab(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await simulationService.resetLab(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getSimulationMetrics(_req, res, next) {
  try {
    const metrics = await simulationService.getSimulationMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}

export async function getSimulationHealth(_req, res, next) {
  try {
    const health = await simulationService.getSimulationHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
}
