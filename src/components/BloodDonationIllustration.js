import React from "react";

function BloodDonationIllustration() {
  return (
    <svg
      className="blood-illustration"
      viewBox="0 0 680 560"
      role="img"
      aria-label="Blood donation and healthcare network illustration"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff1f2" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#ef4444" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect x="0" y="0" width="680" height="560" rx="36" fill="url(#bgGradient)" />
      <circle cx="112" cy="92" r="54" fill="#ffe4e6" />
      <circle cx="592" cy="88" r="38" fill="#fee2e2" />
      <circle cx="548" cy="482" r="48" fill="#ffe4e6" />
      <circle cx="148" cy="468" r="36" fill="#fff1f2" />

      <g filter="url(#shadow)">
        <rect x="66" y="126" width="218" height="154" rx="28" fill="url(#cardGradient)" />
        <rect x="82" y="146" width="84" height="16" rx="8" fill="#fecaca" />
        <rect x="82" y="172" width="146" height="20" rx="10" fill="#fee2e2" />
        <rect x="82" y="206" width="170" height="16" rx="8" fill="#fda4af" />
        <rect x="82" y="232" width="112" height="16" rx="8" fill="#fecdd3" />
      </g>

      <g filter="url(#shadow)">
        <rect x="398" y="116" width="214" height="128" rx="30" fill="#fff" />
        <circle cx="444" cy="170" r="30" fill="#fee2e2" />
        <path
          d="M444 147c9 13 18 20 18 30a18 18 0 1 1-36 0c0-10 9-17 18-30z"
          fill="url(#bloodGradient)"
        />
        <rect x="490" y="148" width="88" height="16" rx="8" fill="#fecaca" />
        <rect x="490" y="176" width="64" height="12" rx="6" fill="#e5e7eb" />
        <rect x="490" y="196" width="80" height="12" rx="6" fill="#e5e7eb" />
      </g>

      <g filter="url(#shadow)">
        <rect x="118" y="340" width="438" height="136" rx="32" fill="#fff" />
        <rect x="142" y="366" width="122" height="16" rx="8" fill="#fecaca" />
        <rect x="142" y="392" width="188" height="14" rx="7" fill="#e5e7eb" />
        <rect x="142" y="416" width="162" height="14" rx="7" fill="#e5e7eb" />
        <rect x="142" y="440" width="100" height="14" rx="7" fill="#e5e7eb" />

        <circle cx="432" cy="404" r="42" fill="#fee2e2" />
        <path
          d="M432 377c11 17 24 25 24 38a24 24 0 1 1-48 0c0-13 13-21 24-38z"
          fill="url(#bloodGradient)"
        />
      </g>

      <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 10" fill="none" opacity="0.7">
        <path d="M283 208 C 330 190, 360 162, 396 164" />
        <path d="M298 404 C 352 388, 378 356, 404 318" />
        <path d="M228 278 C 258 314, 306 336, 380 340" />
      </g>

      <g fill="#fff">
        <circle cx="283" cy="208" r="10" fill="#ef4444" />
        <circle cx="398" cy="164" r="10" fill="#ef4444" />
        <circle cx="298" cy="404" r="10" fill="#ef4444" />
        <circle cx="404" cy="318" r="10" fill="#ef4444" />
        <circle cx="228" cy="278" r="10" fill="#ef4444" />
        <circle cx="380" cy="340" r="10" fill="#ef4444" />
      </g>
    </svg>
  );
}

export default BloodDonationIllustration;

