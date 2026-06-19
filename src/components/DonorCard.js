import React from "react";
import { formatDisplayDate, formatLocation } from "../utils/appData";

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DonorCard({ donor, onReport, allowReport = false, compact = false }) {
  return (
    <article className={`record-card donor-card ${compact ? "is-compact" : ""}`}>
      <div className="record-card-header">
        <div className="avatar-shell">
          {donor.profilePhoto ? (
            <img src={donor.profilePhoto} alt={donor.fullName} className="avatar-image" />
          ) : (
            <span className="avatar-placeholder">{getInitials(donor.fullName)}</span>
          )}
        </div>
        <div className="record-card-meta">
          <div className="record-card-title-row">
            <h3>{donor.fullName}</h3>
            <span className="blood-badge small">{donor.bloodGroup}</span>
          </div>
          <p>{formatLocation(donor)}</p>
          <div className="record-card-submeta">
            <span>{donor.availabilityStatus}</span>
            <span>{donor.sourceType}</span>
          </div>
        </div>
      </div>

      <div className="detail-stack">
        <div className="detail-line">
          <span>Gender</span>
          <strong>{donor.gender}</strong>
        </div>
        <div className="detail-line">
          <span>Mobile</span>
          <strong>{donor.mobileNumber}</strong>
        </div>
        <div className="detail-line">
          <span>Email</span>
          <strong>{donor.email}</strong>
        </div>
        <div className="detail-line">
          <span>Last donation</span>
          <strong>{formatDisplayDate(donor.lastDonationDate)}</strong>
        </div>
        <div className="detail-line">
          <span>Verification</span>
          <strong>{donor.verificationStatus || "Verified"}</strong>
        </div>
      </div>

      {donor.supportMessage ? <p className="card-note">{donor.supportMessage}</p> : null}

      <div className="record-card-footer">
        <span className="status-pill">{donor.availabilityStatus}</span>
        {allowReport ? (
          <button className="button secondary" type="button" onClick={() => onReport?.(donor.id)}>
            Report profile
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default DonorCard;

