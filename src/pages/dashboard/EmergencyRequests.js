import React from "react";
import BloodAvailabilityGrid from "../../components/BloodAvailabilityGrid";
import DonorCard from "../../components/DonorCard";
import RequestCard from "../../components/RequestCard";
import { useAuth } from "../../context/AuthContext";
import { getBloodAvailabilityOverview, getEmergencyRequests, getSmartMatchCounts, searchDonors } from "../../utils/appData";

function buildFocusLocation(currentUser) {
  return {
    country: currentUser?.homeCountry || "India",
    state: currentUser?.homeState || "",
    district: currentUser?.homeDistrict || "",
    city: currentUser?.homeCity || "",
  };
}

function EmergencyRequests() {
  const { currentUser } = useAuth();
  const emergencyRequests = getEmergencyRequests();
  const focusLocation = buildFocusLocation(currentUser);
  const availability = getBloodAvailabilityOverview(focusLocation);

  const emergencyMatches = React.useMemo(() => {
    if (!emergencyRequests.length) {
      return [];
    }

    return searchDonors({
      bloodGroup: emergencyRequests[0].bloodGroupRequired,
      country: emergencyRequests[0].country,
      state: emergencyRequests[0].state,
      district: emergencyRequests[0].district,
      city: emergencyRequests[0].city,
      sortBy: "match",
      pageSize: 24,
    }).results;
  }, [emergencyRequests]);

  const selectedRequestCounts = emergencyRequests[0]
    ? getSmartMatchCounts({
        bloodGroup: emergencyRequests[0].bloodGroupRequired,
        country: emergencyRequests[0].country,
        state: emergencyRequests[0].state,
        district: emergencyRequests[0].district,
        city: emergencyRequests[0].city,
      })
    : null;

  return (
    <div className="dashboard-section-stack">
      <section className="dashboard-hero card-panel">
        <div className="dashboard-hero-copy">
          <span className="section-kicker">Emergency requests</span>
          <h2>Critical cases with expansion ready search</h2>
          <p>
            Emergency mode starts at the city level, then expands through district, state, country, and
            worldwide coverage to surface every matching donor available.
          </p>
        </div>

        <div className="dashboard-hero-stats">
          <article className="stat-card compact">
            <span>Critical requests</span>
            <strong>{emergencyRequests.length}</strong>
          </article>
          <article className="stat-card compact">
            <span>Top matches</span>
            <strong>{emergencyMatches.length}</strong>
          </article>
          <article className="stat-card compact">
            <span>Worldwide tier</span>
            <strong>{selectedRequestCounts?.worldwide || 0}</strong>
          </article>
          <article className="stat-card compact">
            <span>City tier</span>
            <strong>{selectedRequestCounts?.city || 0}</strong>
          </article>
        </div>
      </section>

      <BloodAvailabilityGrid title="Emergency blood availability" subtitle="Global network overview for critical cases" items={availability} compact />

      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Critical cases</span>
            <h2>Open emergency requests</h2>
          </div>
        </div>

        <div className="results-grid">
          {emergencyRequests.length ? (
            emergencyRequests.map((request) => <RequestCard key={request.id} request={request} compact />)
          ) : (
            <div className="empty-state wide">
              <h3>No critical requests right now</h3>
              <p>When a request is marked critical, it will appear here automatically.</p>
            </div>
          )}
        </div>
      </section>

      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Matching donors</span>
            <h2>Best emergency matches for the first critical request</h2>
          </div>
          <span className="status-pill">{emergencyMatches.length} donors</span>
        </div>

        <div className="results-grid">
          {emergencyMatches.length ? (
            emergencyMatches.map((donor) => <DonorCard key={donor.id} donor={donor} compact />)
          ) : (
            <div className="empty-state wide">
              <h3>No donor matches yet</h3>
              <p>Donors will appear here when the first critical request has compatible blood group matches.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default EmergencyRequests;
