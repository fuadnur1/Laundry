import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(form);

      const data = response.data;

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

      alert("Login successful");

      navigate("/");

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div>

      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;