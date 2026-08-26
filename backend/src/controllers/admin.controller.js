import { supabase } from "../config/database.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      customersResult,
      ridersResult,
      partnersResult,
      ordersResult,
      pendingRidersResult,
      pendingPartnersResult,
    ] = await Promise.all([
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role_id", 1),

      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role_id", 2),

      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role_id", 3),

      supabase
        .from("orders")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("rider_profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("verification_status", "PENDING"),

      supabase
        .from("partner_profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("verification_status", "PENDING"),
    ]);

    const results = [
      customersResult,
      ridersResult,
      partnersResult,
      ordersResult,
      pendingRidersResult,
      pendingPartnersResult,
    ];

    const firstError = results.find((result) => result.error);

    if (firstError?.error) {
      throw firstError.error;
    }

    return res.json({
      success: true,
      dashboard: {
        totalCustomers: customersResult.count || 0,
        totalRiders: ridersResult.count || 0,
        totalPartners: partnersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        pendingRiders: pendingRidersResult.count || 0,
        pendingPartners: pendingPartnersResult.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getAdminUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        role_id,
        name,
        email,
        phone,
        account_status
      `)
      .order("role_id", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      users: data || [],
    });
  } catch (error) {
    next(error);
  }
};
export const getAdminOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          service_id,
          service_name_snapshot,
          quantity,
          unit_price_snapshot,
          line_total
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    next(error);
  }
};
export const getAdminRiders = async (req, res, next) => {
  try {
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
        updated_at,
        user:users (
          name,
          email,
          phone,
          account_status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      riders: data || [],
    });
  } catch (error) {
    next(error);
  }
};

export const updateRiderVerification = async (
  req,
  res,
  next
) => {
  try {
    const { riderId } = req.params;
    const { verification_status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message:
          "verification_status must be PENDING, APPROVED, or REJECTED.",
      });
    }

    const { data, error } = await supabase
      .from("rider_profiles")
      .update({
        verification_status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", riderId)
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
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      rider: data,
    });
  } catch (error) {
    next(error);
  }
};
export const getAdminPartners = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("partner_profiles")
      .select(`
        user_id,
        business_name,
        owner_name,
        trade_licence_number,
        description,
        business_address,
        service_radius_km,
        opening_time,
        closing_time,
        verification_status,
        average_rating,
        total_ratings,
        is_open,
        created_at,
        updated_at,
        user:users (
          name,
          email,
          phone,
          account_status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      partners: data || [],
    });
  } catch (error) {
    next(error);
  }
};

export const updatePartnerVerification = async (
  req,
  res,
  next
) => {
  try {
    const { partnerId } = req.params;
    const { verification_status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message:
          "verification_status must be PENDING, APPROVED, or REJECTED.",
      });
    }

    const { data, error } = await supabase
      .from("partner_profiles")
      .update({
        verification_status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", partnerId)
      .select(`
        user_id,
        business_name,
        owner_name,
        trade_licence_number,
        description,
        business_address,
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
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      partner: data,
    });
  } catch (error) {
    next(error);
  }
};