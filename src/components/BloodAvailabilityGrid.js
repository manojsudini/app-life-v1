import React from "react";

function formatCompact(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function BloodAvailabilityGrid({ title, subtitle, items = [], compact = false }) {
  return (
    <section className={`blood-grid-section ${compact ? "is-compact" : ""}`}>
      {title || subtitle ? (
        <div className="section-heading compact">
          <div>
            {title ? <div className="section-kicker">{title}</div> : null}
            {subtitle ? <h2>{subtitle}</h2> : null}
          </div>
        </div>
      ) : null}

      <div className="blood-grid">
        {items.map((item) => (
          <article className="blood-card" key={item.bloodGroup}>
            <div className="blood-card-top">
              <span className="blood-badge">{item.bloodGroup}</span>
              <span className="blood-requests">{formatCompact(item.activeRequests)} active requests</span>
            </div>
            <div className="blood-figure">{formatCompact(item.worldwideAvailability)}</div>
            <div className="blood-label">Worldwide availability</div>
            <div className="blood-meta-grid">
              <div>
                <span>Country</span>
                <strong>{formatCompact(item.countryAvailability)}</strong>
              </div>
              <div>
                <span>State</span>
                <strong>{formatCompact(item.stateAvailability)}</strong>
              </div>
              <div>
                <span>City</span>
                <strong>{formatCompact(item.cityAvailability)}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BloodAvailabilityGrid;

