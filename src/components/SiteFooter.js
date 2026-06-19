import React from "react";
import { Link } from "react-router-dom";
import { getPlatformSnapshot, getPublicNav } from "../utils/appData";

function SiteFooter() {
  const snapshot = getPlatformSnapshot();
  const navItems = getPublicNav();

  return (
    <footer className="site-footer">
      <div className="site-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-lockup">
              <span className="brand-mark">LC</span>
              <span className="brand-copy">
                <strong>Life Connect</strong>
                <small>Healthcare coordination network</small>
              </span>
            </div>
            <p>
              A unified blood donation platform for donors, patients, hospitals, and emergency coordination teams.
            </p>
            <div className="footer-stat-row">
              <div>
                <strong>{snapshot.totalDonors}</strong>
                <span>donors</span>
              </div>
              <div>
                <strong>{snapshot.activeRequests}</strong>
                <span>active requests</span>
              </div>
              <div>
                <strong>{snapshot.countriesCovered}</strong>
                <span>countries</span>
              </div>
            </div>
          </div>

          <div>
            <h3>Quick Links</h3>
            <div className="footer-link-list">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  {item.label}
                </Link>
              ))}
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>

          <div>
            <h3>Trust Notes</h3>
            <p>
              Search results combine seeded global network data with locally created donor and patient records.
              Protected areas require authentication and role checks.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Built for emergency-ready blood coordination.</span>
          <span>Life Connect</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

