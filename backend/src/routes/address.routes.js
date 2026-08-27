import express from "express";
import { supabase } from "../config/database.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET CUSTOMER ADDRESSES
|--------------------------------------------------------------------------
*/

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER ADDRESS
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res, next) => {
  try {
    const {
      user_id,
      label,
      address_line,
      area,
      city,
      postal_code,
      is_default,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!address_line?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (!area?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Area is required.",
      });
    }

    if (!city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    const {
      data: existingAddresses,
      error: existingError,
    } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user_id);

    if (existingError) {
      throw existingError;
    }

    const shouldBeDefault =
      existingAddresses.length === 0 ||
      Boolean(is_default);

    if (shouldBeDefault) {
      const { error: updateError } =
        await supabase
          .from("addresses")
          .update({
            is_default: false,
          })
          .eq("user_id", user_id);

      if (updateError) {
        throw updateError;
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id,

        label:
          label?.trim() || "Home",

        address_line:
          address_line.trim(),

        area: area.trim(),

        city: city.trim(),

        postal_code:
          postal_code?.trim() || null,

        is_default:
          shouldBeDefault,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message:
        "Address saved successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "Create address error:",
      error
    );

    next(error);
  }
});

export default router;