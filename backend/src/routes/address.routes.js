import express from "express";
import { supabase } from "../config/database.js";

const router = express.Router();

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;