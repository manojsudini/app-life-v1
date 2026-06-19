import React from "react";
import { formatDisplayDate, formatLocation } from "../utils/appData";

function RequestCard({ request, onReport, allowReport = false, compact = false }) {
  return (
    <article className={`record-card request-card ${compact ? "is-compact" : ""}`}>
      <div className="record-card-header">
        <div className="request-icon">+</div>
        <div className="record-card-meta">
          <div className="record-card-title-row">
            <h3>{request.hospitalName}</h3>
            <span className={`urgency-badge ${request.urgencyLevel.toLowerCase()}`}>{request.urgencyLevel}</span>
          </div>
          <p>{request.patientName}</p>
          <div className="record-card-submeta">
            <span>{formatLocation(request)}</span>
            <span>{request.status}</span>
          </div>
        </div>
      </div>

      <div className="detail-stack">
        <div className="detail-line">
          <span>Blood group</span>
          <strong>{request.bloodGroupRequired}</strong>
        </div>
        <div className="detail-line">
          <span>Units needed</span>
          <strong>{request.unitsRequired}</strong>
        </div>
        <div className="detail-line">
          <span>Required date</span>
          <strong>{formatDisplayDate(request.requiredDate)}</strong>
        </div>
        <div className="detail-line">
          <span>Contact</span>
          <strong>{request.contactNumber}</strong>
        </div>
      </div>

      {request.medicalNotes ? <p className="card-note">{request.medicalNotes}</p> : null}

      <div className="record-card-footer">
        <span className="status-pill">{request.status}</span>
        {allowReport ? (
          <button className="button secondary" type="button" onClick={() => onReport?.(request.id)}>
            Report request
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default RequestCard;

