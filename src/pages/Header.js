import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav>
      <div className="nav-container">
        <div className="logo">
          <Link to="/">
            Life <span>Connect</span>
          </Link>
        </div>

        <div className="links">
          <div className="link">
            <NavLink to="/">Home</NavLink>
          </div>
          <div className="link">
            <NavLink to="/about">About</NavLink>
          </div>
          <div className="link">
            <NavLink to="/donors">Donors</NavLink>
          </div>
          <div className="link">
            <NavLink to="/patients">Patient</NavLink>
          </div>
          {currentUser ? (
            <>
              <div className="signed-user">{currentUser.name}</div>
              <button className="nav-logout" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : null}
        </div>

        <i
          className={`fa-solid ${menuOpen ? "fa-xmark cancel" : "fa-bars hamburg"}`}
          onClick={() => setMenuOpen((current) => !current)}
        ></i>
      </div>

      <div className="dropdown" style={{ transform: menuOpen ? "translateY(0px)" : "translateY(-500px)" }}>
        <div className="links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/donors">Donors</NavLink>
          <NavLink to="/patients">Patient</NavLink>
          {currentUser ? (
            <button className="mobile-logout" type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Header;
