import express, { Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.js';
import { initDatabase } from './db/database.js';

export function createServerApp(): Express {
  initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'pactroom-server',
      version: '1.0.0',
      uptime: process.uptime()
    });
  });

  // Top-level SSE shortcut
  app.get('/events', (req, res, next) => {
    req.url = '/events';
    apiRouter(req, res, next);
  });

  app.use('/api', apiRouter);

  return app;
}

