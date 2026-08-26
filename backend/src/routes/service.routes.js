import { Router } from "express";

import {
  createListServicesController,
  getServicesByPartner,
} from "../controllers/service.controller.js";

export const createServiceRouter = (dependencies = {}) => {
  const router = Router();

  const listServices = createListServicesController(dependencies);

  router.get("/", listServices);

  router.get(
    "/partner/:partnerId",
    getServicesByPartner
  );

  return router;
};

export default createServiceRouter();