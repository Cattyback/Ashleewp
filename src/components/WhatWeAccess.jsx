import { useEffect } from 'react';
import { useUI } from '../context/UIContext.jsx';

/*
 * Transparency page — explains exactly what WorkPuzzle does (and doesn't do)
 * with the user's Drive. Surfaced from the AccountMenu. This is the kind of
 * page school IT departments look for before whitelisting a tool.
 */

const ITEMS = [
  {
    icon: 'check',
    title: 'Reads file metadata',
    body: 'Names, types, modified dates, and links — so you can see your files in this app.',
  },
  {
    icon: 'check',
    title: 'Creates folders & shortcuts',
    body: 'A "WorkPuzzle" folder in your Drive with one sub-folder per course. Files you attach become shortcuts inside.',
  },
  {
    icon: 'check',
    title: 'Moves files to Trash on request',
    body: 'Only when you click the trash button. Trash is reversible from Drive for 30 days.',
  },
  {
    icon: 'x',
    title: 'Never reads file contents',
    body: 'We don\'t open, download, or analyze the inside of your documents.',
  },
  {
    icon: 'x',
    title: 'Never shares your data',
    body: 'No analytics on file names. No third-party trackers reading your Drive. Your data stays between you and Google.',
  },
];

export default function WhatWeAccess() {
  const { whatWeAccessOpen, closeWhatWeAccess } = useUI();

  useEffect(() => {
    if (!whatWeAccessOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeWhatWeAccess();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [whatWeAccessOpen, closeWhatWeAccess]);

  if (!whatWeAccessOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={closeWhatWeAccess}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface text-ink rounded-3xl ring-1 ring-ink/8 shadow-float w-full max-w-lg p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-label="What we access"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-line/70 mb-1">Transparency</p>
          <h2 className="text-xl font-semibold tracking-tight">What WorkPuzzle accesses</h2>
          <p className="text-sm text-line mt-1">
            We use your Google Drive permission to organize files — that's it. Here's exactly what happens.
          </p>
        </div>

        <ul className="space-y-3">
          {ITEMS.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                  item.icon === 'check' ? 'bg-teal text-paper' : 'bg-ink/5 text-line'
                }`}
                aria-hidden="true"
              >
                {item.icon === 'check' ? <CheckIcon /> : <XIcon />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="text-xs text-line leading-relaxed mt-0.5">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl bg-stone/15 ring-1 ring-stone/30 p-3.5 text-xs text-line leading-relaxed">
          You can revoke access any time from your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline underline-offset-2 hover:text-steel"
          >
            Google account permissions
          </a>{' '}
          page.
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={closeWhatWeAccess}
            className="px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-steel shadow-soft transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
