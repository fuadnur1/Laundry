import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #ddd"
      }}
    >
      <div>
        <Link to="/" style={{ textDecoration: "none" }}>
          <strong>Laundry</strong>
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center"
        }}
      >
        <Link to="/">Home</Link>

        {user ? (
          <>
            <span>{user.email}</span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;