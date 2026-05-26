/*
 * Geometric empty-state illustrations — same offset-squares vocabulary as
 * the WorkPuzzle brand mark. Kept inline as SVG so they inherit colors and
 * carry no extra fetch.
 */

export function EmptyCoursesIllustration() {
  return (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="empty-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#355355" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#355355" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="empty-clay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a37561" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#a37561" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      {/* ground shadow */}
      <ellipse cx="70" cy="98" rx="46" ry="4" fill="#2f2e2a" opacity="0.05" />
      {/* back tile */}
      <rect x="32" y="20" width="58" height="58" rx="10" fill="url(#empty-teal)" stroke="#355355" strokeOpacity="0.45" strokeWidth="1.5" />
      <rect x="42" y="32" width="22" height="3" rx="1.5" fill="#355355" opacity="0.45" />
      <rect x="42" y="40" width="34" height="2.5" rx="1.25" fill="#355355" opacity="0.25" />
      <rect x="42" y="47" width="28" height="2.5" rx="1.25" fill="#355355" opacity="0.25" />
      {/* front tile, offset like the logo */}
      <rect x="58" y="36" width="58" height="58" rx="10" fill="url(#empty-clay)" stroke="#a37561" strokeOpacity="0.55" strokeWidth="1.5" />
      <rect x="68" y="48" width="22" height="3" rx="1.5" fill="#a37561" opacity="0.55" />
      <rect x="68" y="56" width="34" height="2.5" rx="1.25" fill="#a37561" opacity="0.35" />
      <rect x="68" y="63" width="28" height="2.5" rx="1.25" fill="#a37561" opacity="0.35" />
      {/* sparkle */}
      <g opacity="0.7">
        <path d="M118 30 L120 26 L122 30 L126 32 L122 34 L120 38 L118 34 L114 32 Z" fill="#a37561" opacity="0.6" />
      </g>
    </svg>
  );
}

export function EmptyFilesIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="empty-folder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#63869a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#63869a" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="90" rx="42" ry="4" fill="#2f2e2a" opacity="0.05" />
      {/* folder back */}
      <path d="M22 28 h26 l6 8 h44 a4 4 0 0 1 4 4 v36 a4 4 0 0 1 -4 4 h-76 a4 4 0 0 1 -4 -4 v-44 a4 4 0 0 1 4 -4 z" fill="url(#empty-folder)" stroke="#63869a" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* page peeking */}
      <rect x="38" y="48" width="44" height="32" rx="3" fill="#ffffff" stroke="#54616a" strokeOpacity="0.35" strokeWidth="1.2" />
      <rect x="44" y="56" width="20" height="2.5" rx="1.25" fill="#54616a" opacity="0.45" />
      <rect x="44" y="62" width="30" height="2" rx="1" fill="#54616a" opacity="0.3" />
      <rect x="44" y="68" width="24" height="2" rx="1" fill="#54616a" opacity="0.3" />
      {/* search glass */}
      <g transform="translate(78 18)">
        <circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#a37561" strokeOpacity="0.6" strokeWidth="1.6" />
        <path d="M13 13 L19 19" stroke="#a37561" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function EmptyOrganizeIllustration() {
  return (
    <svg width="130" height="100" viewBox="0 0 130 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="empty-link" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a37561" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#355355" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <ellipse cx="65" cy="92" rx="44" ry="4" fill="#2f2e2a" opacity="0.05" />
      {/* left card (a file) */}
      <rect x="14" y="26" width="38" height="48" rx="6" fill="#ffffff" stroke="#54616a" strokeOpacity="0.35" strokeWidth="1.4" />
      <rect x="22" y="36" width="18" height="2.5" rx="1.25" fill="#54616a" opacity="0.5" />
      <rect x="22" y="43" width="22" height="2" rx="1" fill="#54616a" opacity="0.3" />
      <rect x="22" y="49" width="14" height="2" rx="1" fill="#54616a" opacity="0.3" />
      {/* arrow */}
      <path d="M58 50 L78 50" stroke="url(#empty-link)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
      <path d="M76 46 L80 50 L76 54" stroke="#355355" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* right card (course) */}
      <rect x="82" y="20" width="38" height="58" rx="8" fill="#355355" fillOpacity="0.10" stroke="#355355" strokeOpacity="0.5" strokeWidth="1.5" />
      <rect x="82" y="20" width="3" height="58" rx="1.5" fill="#a37561" opacity="0.8" />
      <rect x="92" y="32" width="20" height="3" rx="1.5" fill="#355355" opacity="0.55" />
      <rect x="92" y="40" width="24" height="2.5" rx="1.25" fill="#355355" opacity="0.3" />
      <rect x="92" y="47" width="18" height="2.5" rx="1.25" fill="#355355" opacity="0.3" />
    </svg>
  );
}
