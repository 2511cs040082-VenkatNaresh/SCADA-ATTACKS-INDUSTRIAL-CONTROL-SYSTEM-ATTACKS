import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import assetRoutes from './routes/asset.routes.js';
import telemetryRoutes from './routes/telemetry.routes.js';
import alertRoutes from './routes/alert.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import detectionRoutes from './routes/detection.routes.js';
import systemRoutes from './routes/system.routes.js';
import healthRoutes from './routes/healthRoutes.js';
import simulatorRoutes from './routes/simulator.routes.js';
import internalRoutes from './routes/internal.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import networkRoutes from './routes/network.routes.js';
import protocolRoutes from './routes/protocol.routes.js';
import behavioralRoutes from './routes/behavioral.routes.js';
import mlRoutes from './routes/ml.routes.js';
import mitreRoutes from './routes/mitre.routes.js';
import responseRoutes from './routes/response.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import reportRoutes from './routes/report.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminRoutes from './routes/admin.routes.js';

import { getPipelineHealth } from './controllers/internal.controller.js';
import * as alertController from './controllers/alert.controller.js';
import * as incidentController from './controllers/incident.controller.js';
import * as mitreController from './controllers/mitre.controller.js';
import * as responseController from './controllers/response.controller.js';
import * as simulationController from './controllers/simulation.controller.js';
import * as reportController from './controllers/report.controller.js';

import { securityHeaders } from './middleware/securityHeaders.js';
import { sanitizeInputMiddleware } from './middleware/sanitizer.js';

const app = express();

app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInputMiddleware);
app.use(requestLogger);
app.use(rateLimiter);

// API Route Mounts (Support both /api and /api/v1)
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/v1/users', userRoutes);

app.use('/api/assets', assetRoutes);
app.use('/api/v1/assets', assetRoutes);

app.use('/api/telemetry', telemetryRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);

app.use('/api/alerts', alertRoutes);
app.use('/api/v1/alerts', alertRoutes);

app.use('/api/incidents', incidentRoutes);
app.use('/api/v1/incidents', incidentRoutes);

app.use('/api/detection', detectionRoutes);
app.use('/api/v1/detection', detectionRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/v1/detections', detectionRoutes);
app.use('/api/detection-rules', detectionRoutes);
app.use('/api/v1/detection-rules', detectionRoutes);

app.use('/api/behavioral', behavioralRoutes);
app.use('/api/v1/behavioral', behavioralRoutes);

app.use('/api/ml', mlRoutes);
app.use('/api/v1/ml', mlRoutes);

app.use('/api/mitre', mitreRoutes);
app.use('/api/v1/mitre', mitreRoutes);

app.use('/api/response', responseRoutes);
app.use('/api/v1/response', responseRoutes);

app.use('/api/simulation', simulationRoutes);
app.use('/api/v1/simulation', simulationRoutes);

app.use('/api/reports', reportRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api/system', systemRoutes);
app.use('/api/v1/system', systemRoutes);

app.use('/api/simulator', simulatorRoutes);
app.use('/api/v1/simulator', simulatorRoutes);

app.use('/api/v1/internal', internalRoutes);
app.use('/api/internal', internalRoutes);

app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/discovery', discoveryRoutes);

app.use('/api/v1/network', networkRoutes);
app.use('/api/network', networkRoutes);

app.use('/api/v1/protocols', protocolRoutes);
app.use('/api/protocols', protocolRoutes);

app.get('/api/v1/system/telemetry/health', getPipelineHealth);
app.get('/api/system/telemetry/health', getPipelineHealth);
app.get('/api/v1/system/alerts/health', alertController.getHealth);
app.get('/api/system/alerts/health', alertController.getHealth);
app.get('/api/v1/system/incidents/health', incidentController.getHealth);
app.get('/api/system/incidents/health', incidentController.getHealth);
app.get('/api/v1/system/mitre/health', mitreController.getMitreHealth);
app.get('/api/system/mitre/health', mitreController.getMitreHealth);
app.get('/api/v1/system/response/health', responseController.getResponseHealth);
app.get('/api/system/response/health', responseController.getResponseHealth);
app.get('/api/v1/system/simulation/health', simulationController.getSimulationHealth);
app.get('/api/system/simulation/health', simulationController.getSimulationHealth);
app.get('/api/v1/system/reports/health', reportController.getHealth);
app.get('/api/system/reports/health', reportController.getHealth);

// System & Health Endpoints
app.use('/api', healthRoutes);

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Root Index Fallback
app.get('/', (_req, res) => {
  res.json({
    name: 'ICS-SHIELD REST API Engine',
    phase: 'PHASE_17_REPORTS_AND_ADVANCED_ANALYTICS',
    status: 'ONLINE',
    docs: '/api/system/health',
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
