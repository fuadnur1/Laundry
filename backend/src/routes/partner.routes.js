import express from "express";
import { getPartnerProfile } from "../controllers/partner.controller.js";

const router = express.Router();

router.get("/:userId", getPartnerProfile);

export default router;