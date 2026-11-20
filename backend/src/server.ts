import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { logger } from './logger/index.js';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler } from './middleware/error.js';

import { registerFirPipelineWorker } from './pipelines/firPipeline.js';
import { registerTelecomPipelineWorker } from './pipelines/telecomPipeline.js';
import { registerMediaPipelineWorker } from './pipelines/mediaPipeline.js';

import { authRouter } from './routes/auth.routes.js';
import { casesRouter } from './routes/cases.routes.js';
import { evidenceRouter } from './routes/evidence.routes.js';
import { telecomRouter } from './routes/telecom.routes.js';
import { cryptoRouter } from './routes/crypto.routes.js';
import { linkageRouter } from './routes/linkage.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { mapsRouter } from './routes/maps.routes.js';
import { dossierRouter } from './routes/dossier.routes.js';

const app = express();

// Security & Header Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(correlationMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register Asynchronous Background Processing Pipelines
registerFirPipelineWorker();
registerTelecomPipelineWorker();
registerMediaPipelineWorker();

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>KHAKHI GUARD — Cybercrime Intelligence Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070D1E; color: #F1F5F9; padding: 40px; text-align: center; }
        .card { max-width: 600px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 8px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { color: #DC2626; font-size: 24px; margin-bottom: 8px; letter-spacing: 1px; }
        p { color: #94A3B8; font-size: 14px; line-height: 1.6; }
        .badge { display: inline-block; background: #16A34A20; border: 1px solid #16A34A; color: #4ADE80; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-bottom: 16px; }
        .btn { display: inline-block; background: #DC2626; color: #FFF; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 20px; transition: background 0.2s; }
        .btn:hover { background: #B91C1C; }
        .endpoints { text-align: left; background: #070D1E; border-radius: 4px; padding: 12px 16px; margin-top: 20px; font-family: monospace; font-size: 12px; color: #38BDF8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">SYSTEM OPERATIONAL</div>
        <h1>KHAKHI GUARD BACKEND</h1>
        <p>Statutory Cybercrime Intelligence Engine & REST API Service</p>
        <p style="font-size: 12px; color: #64748B;">MHA I4C Compliant · BNSS Section 106 · BSA Section 63B</p>
        <a href="http://localhost:5173" class="btn">Launch Frontend Dashboard (Port 5173)</a>
        <div class="endpoints">
          <div>• Health: <a href="/api/health" style="color: #38BDF8;">/api/health</a></div>
          <div>• Cases: <a href="/api/cases" style="color: #38BDF8;">/api/cases</a></div>
          <div>• Linkage: <a href="/api/linkage/KG-2026-0818" style="color: #38BDF8;">/api/linkage/KG-2026-0818</a></div>
          <div>• Analytics: <a href="/api/analytics/summary" style="color: #38BDF8;">/api/analytics/summary</a></div>
          <div>• Threat Matrix: <a href="/api/maps/threat-matrix" style="color: #38BDF8;">/api/maps/threat-matrix</a></div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    service: 'KHAKHI GUARD Statutory Cybercrime Intelligence Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    demoMode: config.demoMode,
    correlationId: req.correlationId
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/cases', dossierRouter);
app.use('/api/dossier', dossierRouter);
app.use('/api/cases', casesRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/telecom', telecomRouter);
app.use('/api/crypto', cryptoRouter);
app.use('/api/linkage', linkageRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/maps', mapsRouter);

// Global Error Handler
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`KHAKHI GUARD Backend Server successfully initialized on port ${config.port}`, {
    port: config.port,
    env: config.nodeEnv,
    demoMode: config.demoMode
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal. Initiating graceful shutdown.');
  server.close(() => {
    logger.info('HTTP server closed cleanly.');
    process.exit(0);
  });
});

export default app;
