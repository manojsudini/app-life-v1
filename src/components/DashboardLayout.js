import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardMenu } from "../utils/appData";

function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const menuItems = getDashboardMenu();

  React.useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar desktop-only">
        <div className="dashboard-brand">
          <span className="brand-mark">LC</span>
          <div>
            <strong>Life Connect</strong>
            <small>{currentUser?.role === "donor" ? "Donor dashboard" : "Patient dashboard"}</small>
          </div>
        </div>

        <nav className="dashboard-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `dashboard-link ${isActive ? "active" : ""} ${item.role && currentUser?.role !== item.role ? "locked" : ""}`
              }
            >
              <span>{item.label}</span>
              {item.role && currentUser?.role !== item.role ? <small>{item.role} only</small> : null}
            </NavLink>
          ))}
        </nav>

        <button className="button ghost full-width" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <button className="menu-toggle mobile-only" type="button" onClick={() => setDrawerOpen((value) => !value)}>
            <span />
            <span />
            <span />
          </button>

          <div className="dashboard-topbar-copy">
            <span className="section-kicker">Dashboard</span>
            <h1>Unified healthcare workspace</h1>
          </div>

          <div className="dashboard-topbar-actions">
            <span className="user-pill">
              {currentUser?.name} <small>{currentUser?.role}</small>
            </span>
            <button className="button ghost desktop-only" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      <div className={`mobile-drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`dashboard-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="dashboard-brand">
          <span className="brand-mark">LC</span>
          <div>
            <strong>Life Connect</strong>
            <small>{currentUser?.role === "donor" ? "Donor dashboard" : "Patient dashboard"}</small>
          </div>
        </div>

        <nav className="dashboard-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `dashboard-link ${isActive ? "active" : ""} ${item.role && currentUser?.role !== item.role ? "locked" : ""}`
              }
            >
              <span>{item.label}</span>
              {item.role && currentUser?.role !== item.role ? <small>{item.role} only</small> : null}
            </NavLink>
          ))}
        </nav>

        <button className="button ghost full-width" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </div>
  );
}

export default DashboardLayout;
