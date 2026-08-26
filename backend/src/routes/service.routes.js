import { Router } from 'express';
import { createListServicesController } from '../controllers/service.controller.js';
import { getServicesByPartner } from "../controllers/service.controller.js";
export const createServiceRouter = (dependencies = {}) => {
  const router = Router();

 router.get(
  "/partner/:partnerId",
  getServicesByPartner
);
  return router;
};

export default createServiceRouter();
