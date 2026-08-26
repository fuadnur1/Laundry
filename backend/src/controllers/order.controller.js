import { supabase } from "../config/database.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      customer_id,
      partner_id,
      pickup_address_id,
      return_address_id,
      pickup_slot_start,
      pickup_slot_end,
      items,
      customer_note,
    } = req.body;

    let subtotal = 0;

    const orderItems = items.map((item) => {
      const lineTotal = item.quantity * item.unit_price;

      subtotal += lineTotal;

      return {
        service_id: item.service_id,
        service_name_snapshot: item.service_name,
        unit_type: item.unit_type,
        quantity: item.quantity,
        unit_price_snapshot: item.unit_price,
        line_total: lineTotal,
        special_instruction: item.special_instruction || null,
      };
    });

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: `ORD-${Date.now()}`,

        customer_id,
        partner_id,

        pickup_address_id,
        return_address_id,

        pickup_slot_start,
        pickup_slot_end,

        status: "PLACED",

        subtotal,
        pickup_fee: 0,
        return_fee: 0,
        platform_fee: 0,
        discount_amount: 0,
        total_amount: subtotal,

        currency: "BDT",

        customer_note,
      })
      .select()
      .single();

    if (error) throw error;

    const itemsWithOrder = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(itemsWithOrder);

    if (itemError) throw itemError;

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        items: itemsWithOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*),
        partner_profiles (
          business_name,
          average_rating
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          service_id,
          service_name_snapshot,
          unit_type,
          quantity,
          unit_price_snapshot,
          line_total,
          special_instruction
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
export const getOrdersByPartner = async (req, res, next) => {
  try {
    const { partnerId } = req.params;

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
      .eq("partner_id", partnerId)
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
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "PICKED_UP",
      "CLEANING",
      "QUALITY_CHECK",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const validTransitions = {
      PLACED: ["PICKED_UP", "CANCELLED"],
      RIDER_ASSIGNED: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: ["CLEANING"],
      CLEANING: ["QUALITY_CHECK"],
      QUALITY_CHECK: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
    };

    const allowedNext =
      validTransitions[existingOrder.status] || [];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${existingOrder.status} to ${status}.`,
      });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id)
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
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.json({
      success: true,
      message: `Order updated to ${status}.`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};