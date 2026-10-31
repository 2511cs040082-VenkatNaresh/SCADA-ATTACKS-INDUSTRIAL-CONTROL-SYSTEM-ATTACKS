import express from 'express';
import * as simulationController from '../controllers/simulation.controller.js';

const router = express.Router();

// Status & Health
router.get('/status', simulationController.getStatus);
router.get('/health', simulationController.getSimulationHealth);
router.get('/metrics', simulationController.getSimulationMetrics);

// Scenarios Catalog & Management
router.get('/scenarios', simulationController.getScenarios);
router.get('/scenarios/:id', simulationController.getScenarioById);
router.post('/scenarios/:id/validate', simulationController.validateScenario);
router.post('/scenarios/:id/start', simulationController.startSimulationRun);

// Simulation Runs & Execution Lifecycle
router.get('/runs', simulationController.getSimulationRuns);
router.post('/runs', simulationController.startSimulationRun);
router.get('/runs/:id', simulationController.getSimulationRunById);
router.post('/runs/:id/start', simulationController.startSimulationRun);
router.post('/runs/:id/pause', simulationController.pauseSimulation);
router.post('/runs/:id/resume', simulationController.resumeSimulation);
router.post('/runs/:id/stop', simulationController.stopSimulation);
router.post('/runs/:id/emergency-stop', simulationController.emergencyStop);
router.post('/runs/:id/reset', simulationController.resetLab);

// Emergency & Reset Endpoints
router.post('/pause', simulationController.pauseSimulation);
router.post('/resume', simulationController.resumeSimulation);
router.post('/stop', simulationController.stopSimulation);
router.post('/emergency-stop', simulationController.emergencyStop);
router.post('/reset', simulationController.resetLab);

export default router;
