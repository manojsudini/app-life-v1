import React from "react";
import LocationPicker from "../../components/LocationPicker";
import { useAuth } from "../../context/AuthContext";
import { clearUserPreferences, getUserPreferences, updateUserPreferences } from "../../utils/appData";

function Settings() {
  const { currentUser } = useAuth();
  const [form, setForm] = React.useState(() => {
    const preferences = getUserPreferences();

    return {
      defaultCountry: preferences.defaultCountry || currentUser.homeCountry || "India",
      defaultState: preferences.defaultState || currentUser.homeState || "",
      defaultDistrict: preferences.defaultDistrict || currentUser.homeDistrict || "",
      defaultCity: preferences.defaultCity || currentUser.homeCity || "",
      emailAlerts: preferences.emailAlerts ?? true,
      smsAlerts: preferences.smsAlerts ?? true,
    };
  });
  const [notice, setNotice] = React.useState("");

  const handleLocationChange = (location) => {
    setForm((current) => ({
      ...current,
      defaultCountry: location.country,
      defaultState: location.state,
      defaultDistrict: location.district,
      defaultCity: location.city,
    }));
  };

  const handleToggle = (name) => {
    setForm((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUserPreferences({
      defaultCountry: form.defaultCountry,
      defaultState: form.defaultState,
      defaultDistrict: form.defaultDistrict,
      defaultCity: form.defaultCity,
      emailAlerts: form.emailAlerts,
      smsAlerts: form.smsAlerts,
    });
    setNotice("Preferences saved.");
  };

  const handleReset = () => {
    clearUserPreferences();
    setForm({
      defaultCountry: currentUser.homeCountry || "India",
      defaultState: currentUser.homeState || "",
      defaultDistrict: currentUser.homeDistrict || "",
      defaultCity: currentUser.homeCity || "",
      emailAlerts: true,
      smsAlerts: true,
    });
    setNotice("Preferences reset.");
  };

  return (
    <div className="dashboard-section-stack">
      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Settings</span>
            <h2>Search defaults and alert preferences</h2>
          </div>
          <span className="status-pill">Demo preferences</span>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <LocationPicker
            value={{
              country: form.defaultCountry,
              state: form.defaultState,
              district: form.defaultDistrict,
              city: form.defaultCity,
            }}
            onChange={handleLocationChange}
            prefix="Default search location"
            helperText="This location is used as the default search focus across the app."
          />

          <div className="settings-toggle-grid">
            <button
              className={`toggle-card ${form.emailAlerts ? "active" : ""}`}
              type="button"
              onClick={() => handleToggle("emailAlerts")}
            >
              <strong>Email alerts</strong>
              <span>{form.emailAlerts ? "Enabled" : "Disabled"}</span>
            </button>
            <button
              className={`toggle-card ${form.smsAlerts ? "active" : ""}`}
              type="button"
              onClick={() => handleToggle("smsAlerts")}
            >
              <strong>SMS alerts</strong>
              <span>{form.smsAlerts ? "Enabled" : "Disabled"}</span>
            </button>
          </div>

          <div className="hero-actions compact">
            <button className="button primary" type="submit">
              Save preferences
            </button>
            <button className="button ghost" type="button" onClick={handleReset}>
              Reset defaults
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-two-column">
        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Security</span>
              <h2>Session model</h2>
            </div>
          </div>
          <p>
            Life Connect keeps the current session in local storage for this demo build. The backend scaffold
            in the repository shows how the same flow maps to JWT on Express and MongoDB.
          </p>
        </article>

        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Access control</span>
              <h2>Role aware routing</h2>
            </div>
          </div>
          <p>
            Donor-only screens and patient-only screens are protected. The dashboard shell stays consistent,
            but the available actions change with your role.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Settings;

