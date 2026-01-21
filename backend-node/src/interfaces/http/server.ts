import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from '@shared/config';
import { logger } from '@shared/logger';
import { requestId } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { AppDataSource } from '@infrastructure/database/typeorm/data-source';
import { rabbitInstance } from '@infrastructure/queue';

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
}));

// Manual override to ensure no COOP/COEP/CORP headers are sent (Fix for HTTP Staging)
app.use((_req, res, next) => {
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.removeHeader('Origin-Agent-Cluster');
  next();
});

app.use(cors({ origin: true, credentials: true })); // TODO: Limit origins in production
app.use(cookieParser());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));
app.use(requestId);

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@shared/config/swagger';

import { router } from './routes';

// Health Check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', environment: config.env });
});

// Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1', router);

// Error Handling
app.use(errorHandler);

const start = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('📦 Database initialized');

    // TODO: Connect to Redis
    await rabbitInstance.start();
    logger.info('Connected to RabbitMQ');

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();
