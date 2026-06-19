import React from "react";

const About = () => {
  return (
    <section className="page">
      <div className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">About Life Connect</span>
          <h1>Built to feel closer to a real emergency coordination app.</h1>
          <p>
            The app now focuses on access control, structured donor discovery, patient request integrity,
            proof-based donor submissions, and a simple trust system for community moderation.
          </p>
        </div>
        <div className="hero-panel">
          <div className="stat-pill">
            <strong>Protected</strong>
            <span>Donor and patient pages</span>
          </div>
          <div className="stat-pill">
            <strong>One active</strong>
            <span>Patient request per account</span>
          </div>
          <div className="stat-pill">
            <strong>Proof photo</strong>
            <span>Required for donor profiles</span>
          </div>
        </div>
      </div>

      <div className="page-grid two-column">
        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What changed</span>
              <h2>Core product rules</h2>
            </div>
          </div>
          <ul className="detail-list">
            <li>Unauthenticated visitors are redirected to the homepage before opening donors or patients.</li>
            <li>Patient submissions update the same account-owned record instead of creating duplicates.</li>
            <li>Donor search supports country, state, and blood group filters.</li>
            <li>Community donor profiles require proof photo before appearing in search results.</li>
            <li>Signed-in users can report suspicious records once per account.</li>
          </ul>
        </article>

        <article className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Safety notes</span>
              <h2>How trust is handled</h2>
            </div>
          </div>
          <ul className="detail-list">
            <li>Proof uploads are stored with donor profiles in the local demo database.</li>
            <li>Three reports mark an item as under review or needing review.</li>
            <li>Partner-seeded donor data is shown separately from community donor submissions.</li>
            <li>Hospital proof on patient requests is optional but recommended for faster trust.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default About;
