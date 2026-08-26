import { supabase } from "../config/database.js";

// Get all tasks assigned to one rider
export const getRiderTasks = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    const { data, error } = await supabase
      .from("delivery_tasks")
      .select(`
        id,
        order_id,
        rider_id,
        task_type,
        status,
        pickup_address_snapshot,
        dropoff_address_snapshot,
        verification_code_hash,
        proof_url,
        accepted_at,
        arrived_at,
        collected_at,
        delivered_at,
        created_at,
        updated_at
      `)
      .eq("rider_id", riderId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      tasks: data || [],
    });
  } catch (error) {
    next(error);
  }
};

// Get one delivery task
export const getDeliveryTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const { data, error } = await supabase
      .from("delivery_tasks")
      .select(`
        id,
        order_id,
        rider_id,
        task_type,
        status,
        pickup_address_snapshot,
        dropoff_address_snapshot,
        verification_code_hash,
        proof_url,
        accepted_at,
        arrived_at,
        collected_at,
        delivered_at,
        created_at,
        updated_at
      `)
      .eq("id", taskId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Delivery task not found.",
      });
    }

    return res.json({
      success: true,
      task: data,
    });
  } catch (error) {
    next(error);
  }
};

// Update task status in correct sequence
export const updateDeliveryTaskStatus = async (
  req,
  res,
  next
) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "ARRIVED",
      "COLLECTED",
      "DELIVERED",
      "FAILED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status.",
      });
    }

    // Fetch current task
    const { data: existingTask, error: fetchError } =
      await supabase
        .from("delivery_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({
        success: false,
        message: "Delivery task not found.",
      });
    }

    // Enforce valid status sequence
    const validTransitions = {
      ACCEPTED: ["ARRIVED", "FAILED"],
      ARRIVED: ["COLLECTED", "FAILED"],
      COLLECTED: ["DELIVERED", "FAILED"],
    };

    const allowedNext =
      validTransitions[existingTask.status] || [];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${existingTask.status} to ${status}.`,
      });
    }

    const updateData = {
      status,
    };

    const now = new Date().toISOString();

    if (status === "ARRIVED") {
      updateData.arrived_at = now;
    }

    if (status === "COLLECTED") {
      updateData.collected_at = now;
    }

    if (status === "DELIVERED") {
      updateData.delivered_at = now;
    }

    const { data: updatedTask, error: updateError } =
      await supabase
        .from("delivery_tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single();

    if (updateError) {
      throw updateError;
    }

    return res.json({
      success: true,
      message: `Delivery task updated to ${status}.`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};