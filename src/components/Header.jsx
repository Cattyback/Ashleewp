import { useUI } from '../context/UIContext.jsx';
import AccountMenu from './AccountMenu.jsx';

export default function Header() {
  const { openCommandPalette } = useUI();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="bg-ink text-paper sticky top-0 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true">
            <rect x="2" y="2" width="13" height="13" rx="2" fill="#355355" />
            <rect x="11" y="11" width="13" height="13" rx="2" fill="#a37561" />
          </svg>
          <span className="font-semibold text-[15px] tracking-tight text-paper">WorkPuzzle</span>
        </div>

        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Open command palette"
          className="hidden sm:flex items-center gap-2 flex-1 max-w-md px-3 py-1.5 rounded-full bg-paper/8 hover:bg-paper/12 ring-1 ring-paper/10 text-paper/70 hover:text-paper transition"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="text-sm flex-1 text-left">Search or jump to…</span>
          <kbd className="text-[10px] font-mono bg-paper/10 ring-1 ring-paper/15 px-1.5 py-0.5 rounded text-paper/80">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>

        <AccountMenu />
      </div>
      {/* Warm hairline — a single pixel of clay as architectural accent. */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-clay/60" aria-hidden="true" />
    </header>
  );
}
