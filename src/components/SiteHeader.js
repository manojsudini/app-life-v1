import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPublicNav } from "../utils/appData";

function SiteHeader() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = getPublicNav().filter((item) => {
    if (!currentUser) {
      return item.label !== "Dashboard";
    }

    return item.label !== "Login" && item.label !== "Register";
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="site-shell">
        <div className="site-header-row">
          <Link to="/" className="brand-lockup">
            <span className="brand-mark">LC</span>
            <span className="brand-copy">
              <strong>Life Connect</strong>
              <small>Global blood network</small>
            </span>
          </Link>

          <nav className="site-nav desktop-only">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
            {currentUser ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Dashboard
                </NavLink>
                <button className="button ghost" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="button ghost" to="/login">
                Emergency Login
              </Link>
            )}
            <Link className="button primary" to={currentUser ? "/dashboard/blood-request" : "/login"}>
              Emergency Request
            </Link>
          </nav>

          <button className="menu-toggle mobile-only" type="button" onClick={() => setMenuOpen((value) => !value)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="site-shell">
          <div className="mobile-menu-panel">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
            {currentUser ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
                  Dashboard
                </NavLink>
                <button className="button ghost full-width" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : null}
            <Link className="button primary full-width" to={currentUser ? "/dashboard/blood-request" : "/login"}>
              Emergency Request
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;

