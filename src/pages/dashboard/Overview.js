import React from "react";
import { Link } from "react-router-dom";
import BloodAvailabilityGrid from "../../components/BloodAvailabilityGrid";
import { getBloodAvailabilityOverview, getPlatformSnapshot, getRecentUrgentRequests } from "../../utils/appData";
import { useAuth } from "../../context/AuthContext";

function buildFocusLocation(currentUser) {
  return {
    country: currentUser?.homeCountry || "India",
    state: currentUser?.homeState || "",
    district: currentUser?.homeDistrict || "",
    city: currentUser?.homeCity || "",
  };
}

function Overview() {
  const { currentUser } = useAuth();
  const snapshot = getPlatformSnapshot();
  const focusLocation = buildFocusLocation(currentUser);
  const bloodOverview = getBloodAvailabilityOverview(focusLocation);
  const urgentRequests = getRecentUrgentRequests(4);

  return (
    <div className="dashboard-section-stack">
      <section className="dashboard-hero card-panel">
        <div className="dashboard-hero-copy">
          <span className="section-kicker">Overview</span>
          <h2>Everything important at a glance</h2>
          <p>
            {currentUser?.role === "donor"
              ? "Create and manage your donor profile, then monitor network demand near your home location."
              : "Publish your patient request, watch smart match counts update, and move into emergency search when needed."}
          </p>
          <div className="hero-actions compact">
            <Link className="button primary" to={currentUser?.role === "donor" ? "/dashboard/donor-registration" : "/dashboard/blood-request"}>
              {currentUser?.role === "donor" ? "Open donor form" : "Open request form"}
            </Link>
            <Link className="button ghost" to="/search">
              Search donors
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-stats">
          <article className="stat-card compact">
            <span>Donors</span>
            <strong>{snapshot.totalDonors}</strong>
          </article>
          <article className="stat-card compact">
            <span>Requests</span>
            <strong>{snapshot.activeRequests}</strong>
          </article>
          <article className="stat-card compact">
            <span>Lives saved</span>
            <strong>{snapshot.livesSaved}</strong>
          </article>
          <article className="stat-card compact">
            <span>Countries covered</span>
            <strong>{snapshot.countriesCovered}</strong>
          </article>
        </div>
      </section>

      <BloodAvailabilityGrid
        title="Your home-network view"
        subtitle={`${currentUser?.homeCity || "Selected location"} and the surrounding network`}
        items={bloodOverview}
        compact
      />

      <section className="dashboard-two-column">
        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Emergency feed</span>
              <h2>Recent urgent requests</h2>
            </div>
          </div>

          <div className="mini-feed">
            {urgentRequests.length ? (
              urgentRequests.map((request) => (
                <div className="mini-feed-item" key={request.id}>
                  <div>
                    <strong>{request.hospitalName}</strong>
                    <p>{request.patientName}</p>
                  </div>
                  <span className={`urgency-badge ${request.urgencyLevel.toLowerCase()}`}>{request.urgencyLevel}</span>
                </div>
              ))
            ) : (
              <p className="muted-note">No active urgent requests are available right now.</p>
            )}
          </div>
        </article>

        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Role action</span>
              <h2>{currentUser?.role === "donor" ? "Complete your donor profile" : "Publish your patient request"}</h2>
            </div>
          </div>
          <p>
            {currentUser?.role === "donor"
              ? "A donor profile with photo, contact details, and availability helps hospitals reach you quickly."
              : "A live request with medical notes and document upload helps donors and coordinators respond faster."}
          </p>
          <Link className="button primary" to={currentUser?.role === "donor" ? "/dashboard/donor-registration" : "/dashboard/blood-request"}>
            {currentUser?.role === "donor" ? "Open donor registration" : "Open blood request"}
          </Link>
        </article>
      </section>
    </div>
  );
}

export default Overview;
