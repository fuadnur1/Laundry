import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
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

      const response =
        await loginUser(form);

      const data =
        response.data;

      localStorage.setItem(
        "access_token",
        data.session.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.session.refresh_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/");

      window.location.reload();
    } catch (error) {
      console.log(
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Login failed."
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
            WELCOME BACK
          </span>

          <h1>
            Your laundry is only
            a few clicks away.
          </h1>

          <p>
            Sign in to browse services,
            place orders, and manage your
            laundry from one account.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="eyebrow">
              CUSTOMER LOGIN
            </span>

            <h2>
              Sign in
            </h2>

            <p>
              Enter your account details.
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
              Password

              <input
                name="password"
                type="password"
                placeholder="Enter your password"
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
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            New to Smart Laundry?{" "}

            <Link to="/register">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;