import { supabase, supabaseAuth } from "../config/database.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required.",
      });
    }

    // Create the Supabase Auth user directly through the Admin API.
    // This avoids confirmation-email rate-limit problems for the project demo.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data.user) {
      return res.status(500).json({
        success: false,
        message: "Could not create authentication user.",
      });
    }

    // New registrations from the normal app are customers by default.
    const { data: publicUser, error: userError } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        role_id: 1,
        name,
        email,
        phone,
        account_status: "ACTIVE",
      })
      .select(`
        id,
        role_id,
        name,
        email,
        phone,
        account_status
      `)
      .single();

    // Remove Auth user if the public.users insert fails,
    // so we don't leave an incomplete account behind.
    if (userError) {
      await supabase.auth.admin.deleteUser(data.user.id);

      return res.status(400).json({
        success: false,
        message: userError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Authenticate against Supabase Auth.
    const { data, error } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        message: "Authentication user not found.",
      });
    }

    // Fetch the application's user record.
    // This gives the mobile app role_id for role-based routing.
    const { data: publicUser, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        role_id,
        name,
        email,
        phone,
        account_status
      `)
      .eq("id", data.user.id)
      .single();

    if (userError) {
      return res.status(400).json({
        success: false,
        message: userError.message,
      });
    }

    // Prevent disabled/suspended users from entering the app.
    if (publicUser.account_status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      session: data.session,
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};