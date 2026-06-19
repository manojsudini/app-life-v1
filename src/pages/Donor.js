import React from "react";
import {
  formatDisplayDate,
  formatLocation,
  getAvailabilityOptions,
  getBloodGroups,
  getCommunityDonorByOwner,
  getCountries,
  getPatientRequests,
  getRecentUrgentRequests,
  getSearchableDonors,
  getStatesForCountry,
  reportCommunityDonor,
  upsertCommunityDonor,
} from "../utils/appData";
import { fileToDataUrl } from "../utils/files";
import { useAuth } from "../context/AuthContext";

function buildDonorForm(currentUser, existingDonor) {
  return {
    fullName: existingDonor?.fullName || currentUser.name || "",
    bloodGroup: existingDonor?.bloodGroup || "O+",
    country: existingDonor?.country || currentUser.homeCountry || "India",
    state: existingDonor?.state || currentUser.homeState || "Tamil Nadu",
    city: existingDonor?.city || "",
    phone: existingDonor?.phone || "",
    availability: existingDonor?.availability || "Available now",
    lastDonation: existingDonor?.lastDonation || "",
    note: existingDonor?.note || "",
    proofImage: existingDonor?.proofImage || "",
  };
}

const Donor = () => {
  const { currentUser } = useAuth();
  const [directory, setDirectory] = React.useState(() => getSearchableDonors());
  const [myDonorProfile, setMyDonorProfile] = React.useState(() => getCommunityDonorByOwner(currentUser.id));
  const [patientHighlights, setPatientHighlights] = React.useState(() => getRecentUrgentRequests(4));
  const [filters, setFilters] = React.useState({
    country: "",
    state: "",
    bloodGroup: "",
    query: "",
  });
  const [form, setForm] = React.useState(() => buildDonorForm(currentUser, getCommunityDonorByOwner(currentUser.id)));
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const deferredQuery = React.useDeferredValue(filters.query);

  const countries = getCountries();
  const filterStates = getStatesForCountry(filters.country);
  const formStates = getStatesForCountry(form.country);
  const bloodGroups = getBloodGroups();
  const availabilityOptions = getAvailabilityOptions();

  const reloadData = React.useCallback(() => {
    const nextProfile = getCommunityDonorByOwner(currentUser.id);
    setDirectory(getSearchableDonors());
    setMyDonorProfile(nextProfile);
    setPatientHighlights(getRecentUrgentRequests(4));
    setForm((current) => buildDonorForm(currentUser, nextProfile || current));
  }, [currentUser]);

  React.useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => {
      if (name === "country") {
        return { ...current, country: value, state: "" };
      }

      return { ...current, [name]: value };
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "country") {
        const nextStates = getStatesForCountry(value);
        return { ...current, country: value, state: nextStates[0] || "" };
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

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      upsertCommunityDonor(form, currentUser);
      reloadData();
      setNotice(
        myDonorProfile
          ? "Your donor profile was updated in the community registry."
          : "Your donor profile is now searchable in the community registry."
      );
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  const handleReport = (donorId) => {
    setError("");
    setNotice("");

    try {
      const result = reportCommunityDonor(donorId, currentUser);
      reloadData();
      setNotice(
        result.alreadyReported
          ? "You already reported that donor profile."
          : "Report submitted. The donor profile is now flagged for review."
      );
    } catch (reportError) {
      setError(reportError.message);
    }
  };

  const filteredDonors = directory.filter((donor) => {
    const query = deferredQuery.trim().toLowerCase();
    const matchesCountry = !filters.country || donor.country === filters.country;
    const matchesState = !filters.state || donor.state === filters.state;
    const matchesBloodGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
    const matchesQuery =
      !query ||
      donor.fullName.toLowerCase().includes(query) ||
      donor.city.toLowerCase().includes(query) ||
      donor.state.toLowerCase().includes(query) ||
      donor.country.toLowerCase().includes(query);

    return matchesCountry && matchesState && matchesBloodGroup && matchesQuery;
  });

  const activePatientRequests = getPatientRequests().filter((request) => request.status === "Active");

  return (
    <section className="page">
      <div className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Global Donor Network</span>
          <h1>Search worldwide donors, then publish your own verified donor profile.</h1>
          <p>
            This donor page now stays locked behind login, supports country and state filtering, and asks
            for proof photo before a community donor profile goes live.
          </p>
        </div>
        <div className="hero-panel">
          <div className="stat-pill">
            <strong>{directory.length}</strong>
            <span>Total donor records</span>
          </div>
          <div className="stat-pill">
            <strong>{directory.filter((donor) => donor.isSeeded).length}</strong>
            <span>Verified network entries</span>
          </div>
          <div className="stat-pill">
            <strong>{activePatientRequests.length}</strong>
            <span>Open patient requests</span>
          </div>
        </div>
      </div>

      {notice ? <p className="form-success">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="page-grid two-column">
        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Join registry</span>
              <h2>{myDonorProfile ? "Update donor profile" : "Create donor profile"}</h2>
            </div>
            <p>Each signed-in member can maintain one visible donor profile with proof photo.</p>
          </div>

          <form className="form-stack" onSubmit={handleFormSubmit}>
            <div className="form-row">
              <label>
                Full name
                <input name="fullName" value={form.fullName} onChange={handleFormChange} />
              </label>
              <label>
                Blood group
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleFormChange}>
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
                Country
                <select name="country" value={form.country} onChange={handleFormChange}>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                State
                <select name="state" value={form.state} onChange={handleFormChange}>
                  {formStates.map((state) => (
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
                <input name="city" value={form.city} onChange={handleFormChange} />
              </label>
              <label>
                Contact number
                <input name="phone" value={form.phone} onChange={handleFormChange} />
              </label>
            </div>

            <div className="form-row">
              <label>
                Availability
                <select name="availability" value={form.availability} onChange={handleFormChange}>
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Last donation date
                <input name="lastDonation" type="date" value={form.lastDonation} onChange={handleFormChange} />
              </label>
            </div>

            <label>
              Support note
              <textarea
                name="note"
                rows="4"
                value={form.note}
                onChange={handleFormChange}
                placeholder="Share travel range, timing, or donation preferences."
              />
            </label>

            <label>
              Proof photo
              <input type="file" accept="image/*" onChange={handleProofUpload} />
            </label>

            {form.proofImage ? (
              <div className="image-preview">
                <img src={form.proofImage} alt="Donor proof preview" />
              </div>
            ) : null}

            <button className="button primary full" type="submit">
              {myDonorProfile ? "Update donor profile" : "Publish donor profile"}
            </button>
          </form>
        </article>

        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Search donor data</span>
              <h2>Filter by country, state, and blood group</h2>
            </div>
            <p>The search list combines worldwide seed records and community profiles.</p>
          </div>

          <div className="filter-grid">
            <label>
              Country
              <select name="country" value={filters.country} onChange={handleFilterChange}>
                <option value="">All countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <label>
              State
              <select name="state" value={filters.state} onChange={handleFilterChange} disabled={!filters.country}>
                <option value="">All states</option>
                {filterStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Blood group
              <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange}>
                <option value="">All groups</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search
              <input
                name="query"
                value={filters.query}
                onChange={handleFilterChange}
                placeholder="Name or city"
              />
            </label>
          </div>

          <div className="alert-stack">
            <div className="summary-chip">
              <strong>{filteredDonors.length}</strong>
              <span>matching donors</span>
            </div>
            <div className="summary-chip">
              <strong>{patientHighlights.length}</strong>
              <span>urgent patient cases</span>
            </div>
          </div>

          <div className="mini-board">
            {patientHighlights.length ? (
              patientHighlights.map((request) => (
                <div className="mini-board-item" key={request.id}>
                  <span className={`status-badge urgency-${request.urgency.toLowerCase()}`}>{request.urgency}</span>
                  <strong>{request.patientName}</strong>
                  <span>
                    {request.bloodGroup} • {request.city}, {request.state}
                  </span>
                </div>
              ))
            ) : (
              <p className="muted-note">No urgent patient requests have been posted yet.</p>
            )}
          </div>
        </article>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Search results</span>
            <h2>Worldwide donor records</h2>
          </div>
          <p>Community profiles can be reported once per signed-in account if they look fake.</p>
        </div>

        <div className="card-grid">
          {filteredDonors.length ? (
            filteredDonors.map((donor) => (
              <article className="directory-card" key={donor.id}>
                <div className="card-topline">
                  <span className={`status-badge ${donor.isSeeded ? "official" : "good"}`}>
                    {donor.isSeeded ? "Verified network" : "Community donor"}
                  </span>
                  <span className="status-badge neutral">{donor.bloodGroup}</span>
                </div>
                <h3>{donor.fullName}</h3>
                <p>{formatLocation(donor)}</p>
                <ul className="detail-list compact">
                  <li>Availability: {donor.availability}</li>
                  <li>Last donation: {formatDisplayDate(donor.lastDonation)}</li>
                  <li>Source: {donor.source}</li>
                  <li>Proof: {donor.proofStatus}</li>
                  {!donor.isSeeded ? <li>Reports: {(donor.reportUserIds || []).length}</li> : null}
                </ul>
                <p className="note-text">{donor.note}</p>
                {donor.proofImage ? (
                  <div className="image-preview inline">
                    <img src={donor.proofImage} alt={`${donor.fullName} proof`} />
                  </div>
                ) : null}
                <div className="card-actions">
                  {!donor.isSeeded && donor.ownerId !== currentUser.id ? (
                    <button className="button tertiary" type="button" onClick={() => handleReport(donor.id)}>
                      Report fake
                    </button>
                  ) : donor.ownerId === currentUser.id ? (
                    <span className="pill">Your profile</span>
                  ) : (
                    <span className="pill">Partner verified</span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No donors matched</h3>
              <p>Try widening the country, state, or blood group filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Donor;
