import express from "express";

import {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByPartner,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);

router.get(
  "/customer/:userId",
  getOrdersByCustomer
);

router.get(
  "/partner/:partnerId",
  getOrdersByPartner
);

router.patch(
  "/:id/status",
  updateOrderStatus
);

router.get(
  "/:id",
  getOrderById
);

export default router;