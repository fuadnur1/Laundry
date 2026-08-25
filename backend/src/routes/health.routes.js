import { Router } from 'express';
import { createHealthController } from '../controllers/health.controller.js';

export const createHealthRouter = (dependencies) => {
  const router = Router();

  router.get('/', createHealthController(dependencies));

  return router;
};
