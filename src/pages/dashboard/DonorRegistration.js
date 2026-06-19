import React from "react";
import BloodAvailabilityGrid from "../../components/BloodAvailabilityGrid";
import DonorCard from "../../components/DonorCard";
import LocationPicker from "../../components/LocationPicker";
import SearchableSelect from "../../components/SearchableSelect";
import { useAuth } from "../../context/AuthContext";
import {
  getAvailabilityOptions,
  getBloodAvailabilityOverview,
  getBloodGroups,
  getCommunityDonorByOwner,
  getGenderOptions,
  getSearchableDonors,
  upsertDonorProfile,
} from "../../utils/appData";
import { fileToDataUrl } from "../../utils/files";

function buildInitialForm(currentUser, existingProfile) {
  return {
    fullName: existingProfile?.fullName || currentUser.name || "",
    bloodGroup: existingProfile?.bloodGroup || "O+",
    gender: existingProfile?.gender || "Prefer not to say",
    mobileNumber: existingProfile?.mobileNumber || currentUser.phoneNumber || "",
    email: existingProfile?.email || currentUser.email || "",
    country: existingProfile?.country || currentUser.homeCountry || "India",
    state: existingProfile?.state || currentUser.homeState || "",
    district: existingProfile?.district || currentUser.homeDistrict || "",
    city: existingProfile?.city || currentUser.homeCity || "",
    availabilityStatus: existingProfile?.availabilityStatus || "Available now",
    lastDonationDate: existingProfile?.lastDonationDate || "",
    supportMessage: existingProfile?.supportMessage || "",
    profilePhoto: existingProfile?.profilePhoto || "",
  };
}

function DonorRegistration() {
  const { currentUser } = useAuth();
  const [directory, setDirectory] = React.useState(() => getSearchableDonors());
  const [existingProfile, setExistingProfile] = React.useState(() => getCommunityDonorByOwner(currentUser.id));
  const [form, setForm] = React.useState(() => buildInitialForm(currentUser, getCommunityDonorByOwner(currentUser.id)));
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const bloodGroups = getBloodGroups();
  const genderOptions = getGenderOptions();
  const availabilityOptions = getAvailabilityOptions();
  const availabilityOverview = getBloodAvailabilityOverview(form);

  const reloadDirectory = React.useCallback(() => {
    const nextProfile = getCommunityDonorByOwner(currentUser.id);
    setExistingProfile(nextProfile);
    setDirectory(getSearchableDonors());
    setForm((current) => buildInitialForm(currentUser, nextProfile || current));
  }, [currentUser]);

  React.useEffect(() => {
    reloadDirectory();
  }, [reloadDirectory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setForm((current) => ({ ...current, ...location }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, profilePhoto: dataUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      upsertDonorProfile(form, currentUser);
      reloadDirectory();
      setNotice(existingProfile ? "Your donor profile was updated." : "Your donor profile is now live.");
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  const locationLabel = [form.city, form.district, form.state, form.country].filter(Boolean).join(", ");

  return (
    <div className="dashboard-section-stack">
      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Donor registration</span>
            <h2>{existingProfile ? "Update your donor profile" : "Create a donor profile"}</h2>
          </div>
          <span className="status-pill">Location: {locationLabel || "Not set"}</span>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid two-up">
            <label className="field-group">
              <span className="field-label">Full name</span>
              <input className="text-field" name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <SearchableSelect
              label="Blood group"
              value={form.bloodGroup}
              options={bloodGroups}
              onChange={(value) => setForm((current) => ({ ...current, bloodGroup: value }))}
              placeholder="Search blood group"
              required
            />
          </div>

          <div className="form-grid two-up">
            <SearchableSelect
              label="Gender"
              value={form.gender}
              options={genderOptions}
              onChange={(value) => setForm((current) => ({ ...current, gender: value }))}
              placeholder="Search gender"
              required
            />
            <label className="field-group">
              <span className="field-label">Mobile number</span>
              <input className="text-field" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required />
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Email</span>
            <input className="text-field" name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <LocationPicker value={form} onChange={handleLocationChange} prefix="Donor location" />

          <div className="form-grid two-up">
            <SearchableSelect
              label="Availability status"
              value={form.availabilityStatus}
              options={availabilityOptions}
              onChange={(value) => setForm((current) => ({ ...current, availabilityStatus: value }))}
              placeholder="Search availability"
              required
            />
            <label className="field-group">
              <span className="field-label">Last donation date</span>
              <input
                className="text-field"
                name="lastDonationDate"
                type="date"
                value={form.lastDonationDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Support message</span>
            <textarea
              className="text-area"
              name="supportMessage"
              rows="4"
              value={form.supportMessage}
              onChange={handleChange}
              placeholder="Add any travel preference, timing note, or donation detail."
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">Profile photo</span>
            <input className="file-field" type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          {form.profilePhoto ? (
            <div className="preview-frame">
              <img src={form.profilePhoto} alt="Donor preview" />
            </div>
          ) : null}

          <button className="button primary full-width" type="submit">
            {existingProfile ? "Update donor profile" : "Publish donor profile"}
          </button>
        </form>
      </section>

      <BloodAvailabilityGrid
        title="Donor availability"
        subtitle={`Network counts near ${locationLabel || "your selected location"}`}
        items={availabilityOverview}
        compact
      />

      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Live donor cards</span>
            <h2>Registered network below the form</h2>
          </div>
          <span className="status-pill">{directory.length} donors</span>
        </div>

        <div className="results-grid">
          {directory.map((donor) => (
            <DonorCard key={donor.id} donor={donor} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

export default DonorRegistration;
