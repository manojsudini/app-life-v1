import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LocationPicker from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { getCitiesForCountryStateDistrict, getDistrictsForCountryState, getStatesForCountry } from "../utils/appData";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "donor",
  phoneNumber: "",
  bio: "",
  country: "India",
  state: "",
  district: "",
  city: "",
};

function buildInitialLocation() {
  const country = initialForm.country;
  const state = getStatesForCountry(country)[0] || "";
  const district = getDistrictsForCountryState(country, state)[0] || "";
  const city = getCitiesForCountryStateDistrict(country, state, district)[0] || "";

  return { country, state, district, city };
}

function Register() {
  const { currentUser, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState(() => ({
    ...initialForm,
    ...buildInitialLocation(),
  }));
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");

  React.useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setForm((current) => ({ ...current, ...location }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      register(form);
      setNotice("Account created successfully.");
      navigate(form.role === "donor" ? "/dashboard/donor-registration" : "/dashboard/blood-request", {
        replace: true,
      });
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <section className="auth-section">
      <div className="site-shell">
        <div className="auth-grid register-grid">
          <div className="auth-copy card-panel">
            <span className="section-kicker">Create account</span>
            <h1>Choose donor or patient access and start from the right workflow.</h1>
            <p>
              Donors can publish a live donor profile after login. Patients can create blood requests and
              trigger smart location-aware matching.
            </p>

            <div className="role-info-grid">
              <article className="role-info-card">
                <strong>Donor</strong>
                <p>Creates a donor profile, updates availability, and publishes contact details.</p>
              </article>
              <article className="role-info-card">
                <strong>Patient</strong>
                <p>Submits a blood request, receives smart match counts, and can use emergency search mode.</p>
              </article>
            </div>
          </div>

          <div className="auth-form-panel card-panel">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">Register</span>
                <h2>Start your Life Connect account</h2>
              </div>
            </div>

            {notice ? <p className="form-success">{notice}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <form className="stack-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span className="field-label">Full name</span>
                <input className="text-field" name="name" value={form.name} onChange={handleChange} required />
              </label>

              <div className="field-group">
                <span className="field-label">Role</span>
                <div className="segmented-control">
                  <button
                    className={form.role === "donor" ? "active" : ""}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: "donor" }))}
                  >
                    Donor
                  </button>
                  <button
                    className={form.role === "patient" ? "active" : ""}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: "patient" }))}
                  >
                    Patient
                  </button>
                </div>
              </div>

              <label className="field-group">
                <span className="field-label">Email</span>
                <input className="text-field" name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>

              <label className="field-group">
                <span className="field-label">Password</span>
                <input
                  className="text-field"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">Phone number</span>
                <input className="text-field" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </label>

              <LocationPicker value={form} onChange={handleLocationChange} prefix="Home location" />

              <label className="field-group">
                <span className="field-label">Profile note</span>
                <textarea
                  className="text-area"
                  name="bio"
                  rows="4"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Optional note for your profile and dashboard."
                />
              </label>

              <button className="button primary full-width" type="submit">
                Create account
              </button>
            </form>

            <div className="auth-footnote">
              <span>Already registered?</span>
              <Link to="/login">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
