import React from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommunityDonorByOwner, getPatientRequestByOwner } from "../../utils/appData";
import LocationPicker from "../../components/LocationPicker";

function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const donorProfile = getCommunityDonorByOwner(currentUser.id);
  const patientRequest = getPatientRequestByOwner(currentUser.id);
  const [form, setForm] = React.useState(() => ({
    name: currentUser.name || "",
    phoneNumber: currentUser.phoneNumber || "",
    homeCountry: currentUser.homeCountry || "India",
    homeState: currentUser.homeState || "",
    homeDistrict: currentUser.homeDistrict || "",
    homeCity: currentUser.homeCity || "",
    bio: currentUser.bio || "",
  }));
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setForm((current) => ({
      ...current,
      homeCountry: location.country,
      homeState: location.state,
      homeDistrict: location.district,
      homeCity: location.city,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      updateProfile(form);
      setNotice("Profile updated successfully.");
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <div className="dashboard-section-stack">
      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Profile</span>
            <h2>Account details and preferences</h2>
          </div>
          <span className="status-pill">{currentUser.role}</span>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid two-up">
            <label className="field-group">
              <span className="field-label">Full name</span>
              <input className="text-field" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field-group">
              <span className="field-label">Mobile number</span>
              <input className="text-field" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </label>
          </div>

          <LocationPicker
            value={{
              country: form.homeCountry,
              state: form.homeState,
              district: form.homeDistrict,
              city: form.homeCity,
            }}
            onChange={handleLocationChange}
            prefix="Home location"
          />

          <label className="field-group">
            <span className="field-label">Bio</span>
            <textarea className="text-area" name="bio" rows="4" value={form.bio} onChange={handleChange} />
          </label>

          <button className="button primary full-width" type="submit">
            Save changes
          </button>
        </form>
      </section>

      <section className="dashboard-two-column">
        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Account summary</span>
              <h2>Your current profile</h2>
            </div>
          </div>

          <div className="detail-stack">
            <div className="detail-line">
              <span>Email</span>
              <strong>{currentUser.email}</strong>
            </div>
            <div className="detail-line">
              <span>Role</span>
              <strong>{currentUser.role}</strong>
            </div>
            <div className="detail-line">
              <span>Home location</span>
              <strong>
                {[currentUser.homeCity, currentUser.homeDistrict, currentUser.homeState, currentUser.homeCountry]
                  .filter(Boolean)
                  .join(", ")}
              </strong>
            </div>
            <div className="detail-line">
              <span>Token</span>
              <strong>{currentUser.token ? "Active session" : "None"}</strong>
            </div>
          </div>
        </article>

        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Linked record</span>
              <h2>{currentUser.role === "donor" ? "Donor profile" : "Patient request"}</h2>
            </div>
          </div>

          {currentUser.role === "donor" && donorProfile ? (
            <div className="detail-stack">
              <div className="detail-line">
                <span>Blood group</span>
                <strong>{donorProfile.bloodGroup}</strong>
              </div>
              <div className="detail-line">
                <span>Availability</span>
                <strong>{donorProfile.availabilityStatus}</strong>
              </div>
              <div className="detail-line">
                <span>Location</span>
                <strong>{[donorProfile.city, donorProfile.district, donorProfile.state, donorProfile.country].filter(Boolean).join(", ")}</strong>
              </div>
              <p className="card-note">{donorProfile.supportMessage}</p>
            </div>
          ) : currentUser.role === "patient" && patientRequest ? (
            <div className="detail-stack">
              <div className="detail-line">
                <span>Hospital</span>
                <strong>{patientRequest.hospitalName}</strong>
              </div>
              <div className="detail-line">
                <span>Blood group</span>
                <strong>{patientRequest.bloodGroupRequired}</strong>
              </div>
              <div className="detail-line">
                <span>Urgency</span>
                <strong>{patientRequest.urgencyLevel}</strong>
              </div>
              <p className="card-note">{patientRequest.medicalNotes}</p>
            </div>
          ) : (
            <p className="muted-note">
              {currentUser.role === "donor"
                ? "No donor profile has been published yet."
                : "No patient request has been created yet."}
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

export default Profile;

