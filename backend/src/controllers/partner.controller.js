import { supabase } from "../config/database.js";

export const getPartnerProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("partner_profiles")
      .select(`
        user_id,
        business_name,
        owner_name,
        trade_licence_number,
        description,
        business_address,
        latitude,
        longitude,
        service_radius_km,
        opening_time,
        closing_time,
        verification_status,
        average_rating,
        total_ratings,
        is_open,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Partner profile not found.",
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