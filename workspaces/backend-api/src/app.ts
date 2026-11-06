import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './openapi.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { billingRouter } from './routes/billing.js';
import { v1Router } from './routes/v1.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'backend-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Dynamic OpenAPI 3.1 JSON specification endpoint
  app.get('/openapi.json', (req: Request, res: Response) => {
    const version = (req.query.v as string) || '1.0.0';
    const spec = generateOpenApiDocument(version);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(spec, null, 2));
  });

  // Swagger UI documentation
  const openApiDocument = generateOpenApiDocument();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // REST API Routes
  app.use('/api/v1', v1Router);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/billing', billingRouter);

  return app;
}

