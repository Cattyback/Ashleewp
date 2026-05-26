import { useEffect } from 'react';
import { useUI } from '../context/UIContext.jsx';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const GROUPS = [
  {
    title: 'General',
    items: [
      { keys: [MOD, 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['Esc'], label: 'Close dialog / palette' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { keys: ['N'], label: 'New course' },
      { keys: ['R'], label: 'Refresh' },
    ],
  },
];

export default function ShortcutsHelp() {
  const { shortcutsHelpOpen, closeShortcutsHelp } = useUI();

  useEffect(() => {
    if (!shortcutsHelpOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeShortcutsHelp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcutsHelpOpen, closeShortcutsHelp]);

  if (!shortcutsHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={closeShortcutsHelp}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface text-ink rounded-3xl ring-1 ring-ink/8 shadow-float w-full max-w-md p-6 space-y-5"
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-line/70 mb-1">Help</p>
          <h2 className="text-xl font-semibold tracking-tight">Keyboard shortcuts</h2>
        </div>

        <div className="space-y-5">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-clay mb-2">{g.title}</p>
              <ul className="space-y-1.5">
                {g.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 py-1">
                    <span className="text-sm text-ink">{item.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="font-mono text-[11px] text-ink bg-ink/5 ring-1 ring-ink/10 rounded-md px-2 py-1 min-w-[24px] text-center"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={closeShortcutsHelp}
            className="px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-steel shadow-soft transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
