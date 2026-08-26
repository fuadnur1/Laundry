import express from "express";
import { getRiderProfile } from "../controllers/rider.controller.js";

const router = express.Router();

router.get("/:userId", getRiderProfile);

export default router;