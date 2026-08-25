import express from 'express';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/database.js';
import { createHealthRouter } from './routes/health.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = ({ databaseHealthCheck = checkDatabaseConnection } = {}) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use(`${env.apiPrefix}/health`, createHealthRouter({ databaseHealthCheck }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
