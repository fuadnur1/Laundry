import { supabase } from "../config/database.js";

export const getRiderProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("rider_profiles")
      .select(`
        user_id,
        national_id,
        vehicle_type,
        vehicle_registration,
        licence_number,
        availability_status,
        verification_status,
        average_rating,
        total_ratings,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
    }

    return res.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    next(error);
  }
};