import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../api/auth";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      await registerUser(form);

      navigate("/login");
    } catch (error) {
      console.log(
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-info">
          <span className="eyebrow light">
            JOIN SMART LAUNDRY
          </span>

          <h1>
            Create your customer
            account.
          </h1>

          <p>
            Register once and use your
            account to book laundry
            services and manage orders.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="eyebrow">
              NEW CUSTOMER
            </span>

            <h2>
              Create account
            </h2>

            <p>
              Fill in your details below.
            </p>
          </div>

          {message && (
            <div className="form-message error-state">
              {message}
            </div>
          )}

          <form
            className="form-stack"
            onSubmit={handleSubmit}
          >
            <label>
              Full name

              <input
                name="name"
                placeholder="e.g. Arafat Hossain"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email address

              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Phone number

              <input
                name="phone"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password

              <input
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Register;