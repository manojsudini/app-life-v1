import React from "react";
import BloodAvailabilityGrid from "../../components/BloodAvailabilityGrid";
import DonorCard from "../../components/DonorCard";
import LocationPicker from "../../components/LocationPicker";
import RequestCard from "../../components/RequestCard";
import SearchableSelect from "../../components/SearchableSelect";
import { useAuth } from "../../context/AuthContext";
import {
  countCompatibleDonors,
  getBloodAvailabilityOverview,
  getBloodGroups,
  getRecentUrgentRequests,
  getSmartMatchCounts,
  getUrgencyOptions,
  getPatientRequestByOwner,
  getPatientRequests,
  searchDonors,
  upsertPatientRequest,
} from "../../utils/appData";
import { fileToDataUrl } from "../../utils/files";

function buildInitialForm(currentUser, existingRequest) {
  return {
    patientName: existingRequest?.patientName || currentUser.name || "",
    hospitalName: existingRequest?.hospitalName || "",
    bloodGroupRequired: existingRequest?.bloodGroupRequired || "O+",
    unitsRequired: existingRequest?.unitsRequired || "",
    requiredDate: existingRequest?.requiredDate || "",
    urgencyLevel: existingRequest?.urgencyLevel || "High",
    contactNumber: existingRequest?.contactNumber || currentUser.phoneNumber || "",
    country: existingRequest?.country || currentUser.homeCountry || "India",
    state: existingRequest?.state || currentUser.homeState || "",
    district: existingRequest?.district || currentUser.homeDistrict || "",
    city: existingRequest?.city || currentUser.homeCity || "",
    medicalNotes: existingRequest?.medicalNotes || "",
    documentUrl: existingRequest?.documentUrl || "",
  };
}

function PatientRequest() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = React.useState(() => getPatientRequests());
  const [existingRequest, setExistingRequest] = React.useState(() => getPatientRequestByOwner(currentUser.id));
  const [form, setForm] = React.useState(() => buildInitialForm(currentUser, getPatientRequestByOwner(currentUser.id)));
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const bloodGroups = getBloodGroups();
  const urgencyOptions = getUrgencyOptions();
  const smartCounts = getSmartMatchCounts(form);
  const availabilityOverview = getBloodAvailabilityOverview(form);
  const urgentRequests = getRecentUrgentRequests(4);
  const emergencyMatches = React.useMemo(() => {
    return searchDonors({
      bloodGroup: form.bloodGroupRequired,
      country: form.country,
      state: form.state,
      district: form.district,
      city: form.city,
      sortBy: "match",
      pageSize: 12,
    }).results;
  }, [form.bloodGroupRequired, form.country, form.state, form.district, form.city]);

  const reloadRequests = React.useCallback(() => {
    const nextExistingRequest = getPatientRequestByOwner(currentUser.id);
    setExistingRequest(nextExistingRequest);
    setRequests(getPatientRequests());
    setForm((current) => buildInitialForm(currentUser, nextExistingRequest || current));
  }, [currentUser]);

  React.useEffect(() => {
    reloadRequests();
  }, [reloadRequests]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setForm((current) => ({ ...current, ...location }));
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, documentUrl: dataUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      upsertPatientRequest(form, currentUser);
      reloadRequests();
      setNotice(existingRequest ? "Your patient request was updated." : "Your patient request is now live.");
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  const requestLocationLabel = [form.city, form.district, form.state, form.country].filter(Boolean).join(", ");
  const isCritical = form.urgencyLevel === "Critical";
  const compatibleDonors = countCompatibleDonors(form);

  return (
    <div className="dashboard-section-stack">
      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Patient request</span>
            <h2>{existingRequest ? "Update your request" : "Create a request"}</h2>
          </div>
          <span className={`status-pill ${isCritical ? "alert" : ""}`}>{isCritical ? "Critical" : "Standard"}</span>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid two-up">
            <label className="field-group">
              <span className="field-label">Patient name</span>
              <input className="text-field" name="patientName" value={form.patientName} onChange={handleChange} required />
            </label>
            <label className="field-group">
              <span className="field-label">Hospital name</span>
              <input className="text-field" name="hospitalName" value={form.hospitalName} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-grid two-up">
            <SearchableSelect
              label="Blood group required"
              value={form.bloodGroupRequired}
              options={bloodGroups}
              onChange={(value) => setForm((current) => ({ ...current, bloodGroupRequired: value }))}
              placeholder="Search blood group"
              required
            />
            <label className="field-group">
              <span className="field-label">Units required</span>
              <input className="text-field" name="unitsRequired" value={form.unitsRequired} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-grid two-up">
            <label className="field-group">
              <span className="field-label">Required date</span>
              <input className="text-field" type="date" name="requiredDate" value={form.requiredDate} onChange={handleChange} required />
            </label>
            <SearchableSelect
              label="Urgency level"
              value={form.urgencyLevel}
              options={urgencyOptions}
              onChange={(value) => setForm((current) => ({ ...current, urgencyLevel: value }))}
              placeholder="Search urgency"
              required
            />
          </div>

          <div className="form-grid two-up">
            <label className="field-group">
              <span className="field-label">Contact number</span>
              <input className="text-field" name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
            </label>
            <div className="field-group">
              <span className="field-label">Location</span>
              <div className="searchable-control static">
                <input className="searchable-input static" value={requestLocationLabel} readOnly />
              </div>
            </div>
          </div>

          <LocationPicker value={form} onChange={handleLocationChange} prefix="Request location" />

          <label className="field-group">
            <span className="field-label">Medical notes</span>
            <textarea
              className="text-area"
              name="medicalNotes"
              rows="4"
              value={form.medicalNotes}
              onChange={handleChange}
              placeholder="Add diagnosis details, timing, or hospital instructions."
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">Document upload</span>
            <input className="file-field" type="file" accept="image/*,.pdf" onChange={handleDocumentUpload} />
          </label>

          {form.documentUrl ? (
            <div className="preview-frame">
              <img src={form.documentUrl} alt="Document preview" />
            </div>
          ) : null}

          <button className="button primary full-width" type="submit">
            {existingRequest ? "Update request" : "Publish request"}
          </button>
        </form>
      </section>

      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Smart matching</span>
            <h2>Automatic matches by location tier</h2>
          </div>
          <span className="status-pill">{compatibleDonors} worldwide donors</span>
        </div>

        <div className="match-count-grid">
          <article className="match-count-card">
            <span>Worldwide</span>
            <strong>{smartCounts.worldwide}</strong>
          </article>
          <article className="match-count-card">
            <span>Country</span>
            <strong>{smartCounts.country}</strong>
          </article>
          <article className="match-count-card">
            <span>State</span>
            <strong>{smartCounts.state}</strong>
          </article>
          <article className="match-count-card">
            <span>District</span>
            <strong>{smartCounts.district}</strong>
          </article>
          <article className="match-count-card">
            <span>City</span>
            <strong>{smartCounts.city}</strong>
          </article>
        </div>

        {isCritical ? (
          <div className="critical-note">
            Critical requests automatically expand search from city to worldwide and surface every matching donor.
          </div>
        ) : null}
      </section>

      <BloodAvailabilityGrid
        title="Blood availability statistics"
        subtitle={`Location focus: ${requestLocationLabel || "Worldwide"}`}
        items={availabilityOverview}
        compact
      />

      <section className="card-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Request cards</span>
            <h2>Live patient requests below the form</h2>
          </div>
          <span className="status-pill">{requests.length} requests</span>
        </div>

        <div className="results-grid">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} compact />
          ))}
        </div>
      </section>

      <section className="dashboard-two-column">
        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Emergency matches</span>
              <h2>Donors ready for this request</h2>
            </div>
          </div>

          <div className="results-grid">
            {emergencyMatches.length ? (
              emergencyMatches.map((donor) => <DonorCard key={donor.id} donor={donor} compact />)
            ) : (
              <div className="empty-state wide">
                <h3>No donor matches yet</h3>
                <p>Try widening the location or adjusting the required blood group.</p>
              </div>
            )}
          </div>
        </article>

        <article className="card-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Recent urgency</span>
              <h2>Open critical cases</h2>
            </div>
          </div>

          <div className="mini-feed">
            {urgentRequests.map((request) => (
              <div className="mini-feed-item" key={request.id}>
                <div>
                  <strong>{request.hospitalName}</strong>
                  <p>{request.patientName}</p>
                </div>
                <span className={`urgency-badge ${request.urgencyLevel.toLowerCase()}`}>{request.urgencyLevel}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default PatientRequest;
