import { useEffect, useRef, useState } from 'react';

// `target: null` means scroll the window to the very top instead of an anchor.
const NAV = [
  { id: 'all', label: 'All Files', target: null },
  { id: 'by-course', label: 'By Course', target: 'nav-courses' },
  { id: 'queue', label: 'Queue', target: 'nav-organize' },
];

const MARKERS = {
  all: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2" width="9" height="8" rx="1" />
      <path d="M1.5 5h9" />
    </svg>
  ),
  'by-course': (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="4" height="4" rx="0.5" />
      <rect x="6.5" y="1.5" width="4" height="4" rx="0.5" />
      <rect x="1.5" y="6.5" width="4" height="4" rx="0.5" />
      <rect x="6.5" y="6.5" width="4" height="4" rx="0.5" />
    </svg>
  ),
  queue: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h8M2 6h8M2 9h5" />
    </svg>
  ),
};

export default function Sidebar() {
  const [active, setActive] = useState('all');
  // Suppress IO-driven active updates briefly after a click, so the smooth
  // scroll doesn't fight the user's intent. ts=0 means "no lock".
  const intentLockRef = useRef({ id: null, ts: 0 });

  useEffect(() => {
    const items = NAV.filter((n) => n.target)
      .map((n) => ({ id: n.id, el: document.getElementById(n.target) }))
      .filter((x) => x.el);
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Honor a recent click — IO would otherwise race the smooth scroll
        // and snap active to whichever section happens to cross the threshold first.
        if (Date.now() - intentLockRef.current.ts < 900) return;

        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) =>
          a.intersectionRatio > b.intersectionRatio ? a : b,
        );
        const match = items.find((x) => x.el === top.target);
        if (!match) return;

        // If we're truly at the top of the page, prefer to keep "All Files"
        // lit rather than auto-switching to by-course.
        if (window.scrollY < 40) {
          setActive('all');
        } else {
          setActive(match.id);
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    items.forEach((x) => observer.observe(x.el));
    return () => observer.disconnect();
  }, []);

  const handleClick = (item) => {
    setActive(item.id);
    intentLockRef.current = { id: item.id, ts: Date.now() };
    if (!item.target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(item.target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <aside className="md:w-56 shrink-0 md:sticky md:top-20 md:self-start">
      <p className="hidden md:block text-[10px] uppercase tracking-[0.24em] text-clay mb-2 px-1">
        Navigate
      </p>
      <nav className="flex md:flex-col gap-1 bg-stone/15 rounded-2xl p-1.5 ring-1 ring-stone/30 shadow-soft overflow-x-auto">
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              aria-current={isActive ? 'true' : undefined}
              className={`flex-1 md:flex-none flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left whitespace-nowrap transition ${
                isActive
                  ? 'bg-teal text-paper shadow-sm'
                  : 'text-ink/80 hover:bg-surface/70'
              }`}
            >
              <span className={isActive ? 'text-paper' : 'text-clay'}>
                {MARKERS[item.id]}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
