import express from "express";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminOrders,
  getAdminRiders,
  updateRiderVerification,
  getAdminPartners,
  updatePartnerVerification,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAdminUsers);
router.get("/orders", getAdminOrders);

router.get("/riders", getAdminRiders);

router.patch(
  "/riders/:riderId/verification",
  updateRiderVerification
);

router.get("/partners", getAdminPartners);

router.patch(
  "/partners/:partnerId/verification",
  updatePartnerVerification
);

export default router;