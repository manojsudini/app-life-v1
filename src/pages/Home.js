import React from "react";
import { Link, useNavigate } from "react-router-dom";
import BloodAvailabilityGrid from "../components/BloodAvailabilityGrid";
import BloodDonationIllustration from "../components/BloodDonationIllustration";
import LocationPicker from "../components/LocationPicker";
import SearchableSelect from "../components/SearchableSelect";
import {
  getAvailabilityOptions,
  getBloodAvailabilityOverview,
  getBloodGroups,
  getEmergencyBanner,
  getHomeSteps,
  getPlatformSnapshot,
  getTestimonials,
  getStatesForCountry,
  getDistrictsForCountryState,
  getCitiesForCountryStateDistrict,
} from "../utils/appData";
import { useAuth } from "../context/AuthContext";

function buildDefaultLocation(currentUser) {
  const country = currentUser?.homeCountry || "India";
  const state = currentUser?.homeState || getStatesForCountry(country)[0] || "";
  const district = currentUser?.homeDistrict || getDistrictsForCountryState(country, state)[0] || "";
  const city = currentUser?.homeCity || getCitiesForCountryStateDistrict(country, state, district)[0] || "";

  return { country, state, district, city };
}

function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const snapshot = getPlatformSnapshot();
  const [bloodGroup, setBloodGroup] = React.useState("");
  const [location, setLocation] = React.useState(() => buildDefaultLocation(currentUser));

  const availability = React.useMemo(() => getBloodAvailabilityOverview(location), [location]);
  const steps = getHomeSteps();
  const testimonials = getTestimonials();
  const banner = getEmergencyBanner();
  const bloodGroups = getBloodGroups();
  const availabilityOptions = getAvailabilityOptions();
  const heroLocationLabel = [location.city, location.district, location.state, location.country].filter(Boolean).join(", ");

  const handleSearch = () => {
    const query = new URLSearchParams();

    if (bloodGroup) {
      query.set("bloodGroup", bloodGroup);
    }

    query.set("country", location.country);
    query.set("state", location.state);
    query.set("district", location.district);
    query.set("city", location.city);

    navigate(`/search?${query.toString()}`);
  };

  return (
    <div>
      <section className="hero-section">
        <div className="site-shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="section-kicker">Global blood network</span>
              <h1>Find life-saving blood across city, state, country, and worldwide networks.</h1>
              <p className="hero-lead">
                Life Connect brings donor discovery, emergency requests, and role-based access into one
                healthcare platform inspired by modern blood-donation networks.
              </p>

              <div className="hero-actions">
                <Link className="button primary" to={currentUser ? "/dashboard/blood-request" : "/login"}>
                  Emergency Blood Request
                </Link>
                <Link className="button ghost" to="/search">
                  Search donors
                </Link>
              </div>

              <div className="hero-search-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-mini-title">Search Blood Group</span>
                    <p>Pick a blood group and location to scan the full network.</p>
                  </div>
                  <span className="status-pill">Focused on {heroLocationLabel}</span>
                </div>

                <div className="hero-search-grid">
                  <SearchableSelect
                    label="Blood group"
                    value={bloodGroup}
                    options={bloodGroups}
                    onChange={setBloodGroup}
                    placeholder="Search blood group"
                  />
                  <LocationPicker value={location} onChange={setLocation} prefix="Location focus" />
                </div>

                <div className="hero-actions compact">
                  <button className="button primary" type="button" onClick={handleSearch}>
                    Find donors
                  </button>
                  <div className="helper-pill">{availabilityOptions[0]} updates are prioritized first.</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <BloodDonationIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Donors</span>
              <strong>{snapshot.totalDonors}</strong>
              <p>Seeded global records plus community registrations.</p>
            </article>
            <article className="stat-card">
              <span>Active Requests</span>
              <strong>{snapshot.activeRequests}</strong>
              <p>Open patient cases across the network.</p>
            </article>
            <article className="stat-card">
              <span>Lives Saved</span>
              <strong>{snapshot.livesSaved}</strong>
              <p>A synthetic impact metric for the connected network.</p>
            </article>
            <article className="stat-card">
              <span>Blood Groups Available</span>
              <strong>{snapshot.bloodGroupsAvailable}</strong>
              <p>All eight blood groups are represented.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="site-shell">
          <BloodAvailabilityGrid
            title="Blood availability overview"
            subtitle={`Selected location: ${heroLocationLabel}`}
            items={availability}
          />
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">How it works</span>
              <h2>One platform, four clear steps</h2>
            </div>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card" key={step.title}>
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="emergency-banner">
            <div>
              <span className="section-kicker">{banner.eyebrow}</span>
              <h2>{banner.title}</h2>
              <p>{banner.text}</p>
            </div>
            <Link className="button primary" to={currentUser ? "/dashboard/blood-request" : "/login"}>
              {banner.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Testimonials</span>
              <h2>Built for clinicians, donors, and coordinators</h2>
            </div>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <p>"{testimonial.quote}"</p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
