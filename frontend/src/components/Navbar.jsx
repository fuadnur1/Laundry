import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="site-header">
      <nav className="navbar shell">
        {/* BRAND */}
        <Link to="/" className="brand">
          <span className="brand-mark">
            <img
              src={logo}
              alt="Smart Laundry logo"
              className="brand-logo"
            />
          </span>

          <span className="brand-copy">
            <strong>Smart Laundry</strong>
            <small>Clean clothes. Less hassle.</small>
          </span>
        </Link>

        {/* NAVIGATION */}
        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          {user && Number(user.role_id) === 1 && (
            <NavLink to="/orders">
              My Orders
            </NavLink>
          )}

          {user ? (
            <>
              <div className="nav-user">
                <span className="user-dot">
                  {(user.name || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="nav-user-copy">
                  <strong>
                    {user.name || "Customer"}
                  </strong>

                  <small>
                    {user.email}
                  </small>
                </span>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                Login
              </NavLink>

              <Link
                to="/register"
                className="btn btn-primary btn-small"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;