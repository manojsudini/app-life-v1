import React from "react";
import {
  countCompatibleDonors,
  formatDisplayDate,
  formatLocation,
  getBloodGroups,
  getCountries,
  getPatientRequestByOwner,
  getPatientRequests,
  getStatesForCountry,
  getUrgencyOptions,
  reportPatientRequest,
  upsertPatientRequest,
} from "../utils/appData";
import { fileToDataUrl } from "../utils/files";
import { useAuth } from "../context/AuthContext";

function buildInitialForm(currentUser, existingRequest) {
  return {
    patientName: existingRequest?.patientName || currentUser.name || "",
    hospitalName: existingRequest?.hospitalName || "",
    bloodGroup: existingRequest?.bloodGroup || "O+",
    country: existingRequest?.country || currentUser.homeCountry || "India",
    state: existingRequest?.state || currentUser.homeState || "Tamil Nadu",
    city: existingRequest?.city || "",
    unitsNeeded: existingRequest?.unitsNeeded || "",
    requiredBy: existingRequest?.requiredBy || "",
    urgency: existingRequest?.urgency || "High",
    contactNumber: existingRequest?.contactNumber || "",
    conditionNote: existingRequest?.conditionNote || "",
    proofImage: existingRequest?.proofImage || "",
  };
}

const Patients = () => {
  const { currentUser } = useAuth();
  const [existingRequest, setExistingRequest] = React.useState(() => getPatientRequestByOwner(currentUser.id));
  const [requests, setRequests] = React.useState(() => getPatientRequests());
  const [form, setForm] = React.useState(() => buildInitialForm(currentUser, getPatientRequestByOwner(currentUser.id)));
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const bloodGroups = getBloodGroups();
  const urgencyOptions = getUrgencyOptions();
  const countries = getCountries();
  const states = getStatesForCountry(form.country);

  const reloadData = React.useCallback(() => {
    const nextExistingRequest = getPatientRequestByOwner(currentUser.id);
    setExistingRequest(nextExistingRequest);
    setRequests(getPatientRequests());
    setForm((current) => buildInitialForm(currentUser, nextExistingRequest || current));
  }, [currentUser]);

  React.useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "country") {
        const nextStates = getStatesForCountry(value);
        return {
          ...current,
          country: value,
          state: nextStates[0] || "",
        };
      }

      return { ...current, [name]: value };
    });
  };

  const handleProofUpload = async (event) => {
    const file = event.target.files?.[0];
    setError("");

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, proofImage: dataUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      upsertPatientRequest(form, currentUser);
      reloadData();
      setNotice(
        existingRequest
          ? "Your patient request was updated in the registry."
          : "Your patient request is now visible in the registry."
      );
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReport = (requestId) => {
    setError("");
    setNotice("");

    try {
      const result = reportPatientRequest(requestId, currentUser);
      reloadData();
      setNotice(
        result.alreadyReported
          ? "You already reported that patient request."
          : "Report submitted. The request is now flagged for review."
      );
    } catch (reportError) {
      setError(reportError.message);
    }
  };

  const myRequestMatchCount = countCompatibleDonors(form);

  return (
    <section className="page">
      <div className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Patient Registry</span>
          <h1>One account, one active patient request, always editable.</h1>
          <p>
            Every signed-in account can publish one patient request. Submitting the form again updates that
            same record instead of creating duplicates, which keeps the help board clean and trustworthy.
          </p>
        </div>
        <div className="hero-panel">
          <div className="stat-pill">
            <strong>{requests.filter((request) => request.status === "Active").length}</strong>
            <span>Active requests</span>
          </div>
          <div className="stat-pill">
            <strong>{myRequestMatchCount}</strong>
            <span>Matching donors</span>
          </div>
          <div className="stat-pill">
            <strong>{existingRequest ? "1/1" : "0/1"}</strong>
            <span>Request slots used</span>
          </div>
        </div>
      </div>

      {notice ? <p className="form-success">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="page-grid two-column">
        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Submit details</span>
              <h2>{existingRequest ? "Update patient request" : "Create patient request"}</h2>
            </div>
            <p>Submitting again updates your only active request for this account.</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Patient name
                <input name="patientName" value={form.patientName} onChange={handleChange} />
              </label>
              <label>
                Hospital
                <input name="hospitalName" value={form.hospitalName} onChange={handleChange} />
              </label>
            </div>

            <div className="form-row">
              <label>
                Country
                <select name="country" value={form.country} onChange={handleChange}>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                State
                <select name="state" value={form.state} onChange={handleChange}>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                City
                <input name="city" value={form.city} onChange={handleChange} />
              </label>
              <label>
                Blood group
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Units needed
                <input name="unitsNeeded" value={form.unitsNeeded} onChange={handleChange} placeholder="2 units" />
              </label>
              <label>
                Required by
                <input name="requiredBy" type="date" value={form.requiredBy} onChange={handleChange} />
              </label>
            </div>

            <div className="form-row">
              <label>
                Urgency
                <select name="urgency" value={form.urgency} onChange={handleChange}>
                  {urgencyOptions.map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {urgency}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Contact number
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} />
              </label>
            </div>

            <label>
              Situation summary
              <textarea
                name="conditionNote"
                rows="4"
                value={form.conditionNote}
                onChange={handleChange}
                placeholder="Share why blood is needed, hospital instructions, and any timing details."
              />
            </label>

            <label>
              Hospital proof photo (recommended)
              <input type="file" accept="image/*" onChange={handleProofUpload} />
            </label>

            {form.proofImage ? (
              <div className="image-preview">
                <img src={form.proofImage} alt="Patient proof preview" />
              </div>
            ) : null}

            <button className="button primary full" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : existingRequest ? "Update request" : "Publish request"}
            </button>
          </form>
        </article>

        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your status</span>
              <h2>Current request snapshot</h2>
            </div>
            <p>Donors see this information once you publish it.</p>
          </div>

          {existingRequest ? (
            <div className="detail-card accent">
              <div className="card-topline">
                <span className={`status-badge ${existingRequest.status === "Active" ? "good" : "alert"}`}>
                  {existingRequest.status}
                </span>
                <span className={`status-badge urgency-${existingRequest.urgency.toLowerCase()}`}>
                  {existingRequest.urgency}
                </span>
              </div>
              <h3>{existingRequest.patientName}</h3>
              <p>{existingRequest.hospitalName}</p>
              <ul className="detail-list">
                <li>Blood group: {existingRequest.bloodGroup}</li>
                <li>Location: {formatLocation(existingRequest)}</li>
                <li>Units needed: {existingRequest.unitsNeeded}</li>
                <li>Required by: {formatDisplayDate(existingRequest.requiredBy)}</li>
                <li>Possible donor matches: {existingRequest.compatibilityMatches}</li>
                <li>Reports: {(existingRequest.reportUserIds || []).length}</li>
              </ul>
              {existingRequest.proofImage ? (
                <div className="image-preview inline">
                  <img src={existingRequest.proofImage} alt="Uploaded patient proof" />
                </div>
              ) : (
                <p className="muted-note">No proof photo uploaded yet.</p>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No patient request yet</h3>
              <p>Complete the form to place one live request in the database for your account.</p>
            </div>
          )}

          <div className="safety-note">
            <strong>Trust layer:</strong> three community reports automatically flag a patient entry for review.
          </div>
        </article>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Community board</span>
            <h2>Live patient requests</h2>
          </div>
          <p>Signed-in members can report suspicious posts once per account.</p>
        </div>

        <div className="card-grid">
          {requests.length ? (
            requests.map((request) => (
              <article className="directory-card" key={request.id}>
                <div className="card-topline">
                  <span className={`status-badge ${request.status === "Active" ? "good" : "alert"}`}>
                    {request.status}
                  </span>
                  <span className={`status-badge urgency-${request.urgency.toLowerCase()}`}>{request.urgency}</span>
                </div>
                <h3>{request.patientName}</h3>
                <p>{request.hospitalName}</p>
                <ul className="detail-list compact">
                  <li>{request.bloodGroup} needed by {formatDisplayDate(request.requiredBy)}</li>
                  <li>{formatLocation(request)}</li>
                  <li>{request.unitsNeeded}</li>
                  <li>Matches found: {request.compatibilityMatches}</li>
                  <li>Reports: {(request.reportUserIds || []).length}</li>
                </ul>
                <p className="note-text">{request.conditionNote}</p>
                <div className="card-actions">
                  <span className="muted-note">Updated {formatDisplayDate(request.updatedAt)}</span>
                  {request.ownerId !== currentUser.id ? (
                    <button className="button tertiary" type="button" onClick={() => handleReport(request.id)}>
                      Report fake
                    </button>
                  ) : (
                    <span className="pill">Your request</span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No requests yet</h3>
              <p>The board will fill here as patients submit verified details.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Patients;
