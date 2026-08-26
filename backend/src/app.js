import express from 'express';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/database.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createServiceRouter } from './routes/service.routes.js';
import { notFound } from './middleware/notFound.js';
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from './middleware/errorHandler.js';
import orderRoutes from "./routes/order.routes.js";
import cors from "cors";
import addressRoutes from "./routes/address.routes.js";
import deliveryTaskRoutes from "./routes/deliveryTask.routes.js";
import riderRoutes from "./routes/rider.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import adminRoutes from "./routes/admin.routes.js";

export const createApp = ({
  databaseHealthCheck = checkDatabaseConnection,
  serviceRepository,
} = {}) => {
  const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8081",
    ],
    credentials: true,
  })
);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use("/api/v1/orders", orderRoutes);
  app.use("/api/v1/addresses", addressRoutes);
  app.use("/api/v1/delivery-tasks", deliveryTaskRoutes);
  app.use("/api/v1/riders", riderRoutes);
  app.use("/api/v1/partners", partnerRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use(`${env.apiPrefix}/health`, createHealthRouter({ databaseHealthCheck }));
  app.use(`${env.apiPrefix}/auth`, authRoutes);
  app.use(`${env.apiPrefix}/services`, createServiceRouter({ serviceRepository }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
