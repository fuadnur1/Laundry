import express from "express";

import {
  getRiderTasks,
  getDeliveryTaskById,
  updateDeliveryTaskStatus,
} from "../controllers/deliveryTask.controller.js";

const router = express.Router();

// Get tasks assigned to a rider
router.get("/rider/:riderId", getRiderTasks);

// Get one task
router.get("/:taskId", getDeliveryTaskById);

// Update task status
router.patch(
  "/:taskId/status",
  updateDeliveryTaskStatus
);

export default router;