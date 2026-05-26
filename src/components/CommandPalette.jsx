import { useEffect, useMemo, useRef, useState } from 'react';
import { useCourses } from '../context/CourseContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import useDriveFiles from '../hooks/useDriveFiles.js';
import { iconForMime } from '../utils/fileIcons.js';

/*
 * ⌘K command palette. Searches across:
 *   - Courses (by name and code)
 *   - Recent Drive files (by name)
 *   - Quick actions (new course, refresh, sign out, help, transparency)
 *
 * Keyboard: ↑/↓ to move, Enter to run, Esc to close. Filtering is plain
 * substring (case-insensitive) — fuzzy match is overkill for the dataset
 * size and trips on multi-word course names.
 */

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const MAX_PER_GROUP = 6;

export default function CommandPalette({ onNewCourse, onRefresh }) {
  const { commandPaletteOpen, closeCommandPalette, openShortcutsHelp, openWhatWeAccess } = useUI();
  const { courses } = useCourses();
  const { files } = useDriveFiles();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    setQuery('');
    setActive(0);
    queueMicrotask(() => inputRef.current?.focus());
  }, [commandPaletteOpen]);

  const actions = useMemo(
    () => [
      {
        id: 'action:new-course',
        title: 'New course',
        keywords: 'add new course create',
        icon: <PlusIcon />,
        run: () => onNewCourse?.(),
      },
      {
        id: 'action:refresh',
        title: 'Refresh Drive',
        keywords: 'refresh reload sync',
        icon: <RefreshIcon />,
        run: () => onRefresh?.(),
      },
      {
        id: 'action:shortcuts',
        title: 'Keyboard shortcuts',
        keywords: 'help shortcuts keys',
        icon: <HelpIcon />,
        run: () => openShortcutsHelp(),
      },
      {
        id: 'action:access',
        title: 'What we access',
        keywords: 'privacy permissions transparency drive',
        icon: <ShieldIcon />,
        run: () => openWhatWeAccess(),
      },
    ],
    [onNewCourse, onRefresh, openShortcutsHelp, openWhatWeAccess],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchAction = (a) =>
      !q || a.title.toLowerCase().includes(q) || a.keywords.toLowerCase().includes(q);
    const matchCourse = (c) => {
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.instructor?.toLowerCase().includes(q)
      );
    };
    const matchFile = (f) => !q || f.name?.toLowerCase().includes(q);

    const filteredActions = actions.filter(matchAction);
    const filteredCourses = courses.filter(matchCourse).slice(0, MAX_PER_GROUP);
    const filteredFiles = files
      .filter((f) => f.mimeType !== FOLDER_MIME)
      .filter(matchFile)
      .slice(0, MAX_PER_GROUP);

    const result = [];
    if (filteredActions.length) result.push({ title: 'Actions', items: filteredActions.map((a) => ({
      id: a.id,
      title: a.title,
      icon: a.icon,
      run: () => { closeCommandPalette(); a.run(); },
    })) });
    if (filteredCourses.length) result.push({ title: 'Courses', items: filteredCourses.map((c) => ({
      id: `course:${c.id}`,
      title: c.name,
      hint: c.code || c.instructor || null,
      icon: <CourseDot color={c.color} />,
      run: () => {
        closeCommandPalette();
        document.getElementById('nav-organize')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    })) });
    if (filteredFiles.length) result.push({ title: 'Recent files', items: filteredFiles.map((f) => ({
      id: `file:${f.id}`,
      title: f.name,
      icon: <span className="text-base">{iconForMime(f.mimeType)}</span>,
      run: () => {
        closeCommandPalette();
        if (f.webViewLink) window.open(f.webViewLink, '_blank', 'noopener,noreferrer');
      },
    })) });
    return result;
  }, [query, actions, courses, files, closeCommandPalette]);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (active >= flatItems.length) setActive(0);
  }, [flatItems.length, active]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(flatItems.length - 1, i + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        flatItems[active]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, flatItems, active, closeCommandPalette]);

  // Scroll the active item into view as you arrow through results.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!commandPaletteOpen) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-ink/40 backdrop-blur-sm"
      onClick={closeCommandPalette}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface text-ink rounded-3xl ring-1 ring-ink/8 shadow-float w-full max-w-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink/8">
          <SearchIcon className="text-line shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search courses, files, actions…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-line/60"
            aria-label="Command palette search"
          />
          <kbd className="text-[10px] font-mono text-line bg-ink/5 px-1.5 py-0.5 rounded shrink-0">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto py-1.5 pb-2">
          {flatItems.length === 0 ? (
            <p className="px-5 py-8 text-sm text-line text-center">No matches. Try a different search.</p>
          ) : (
            groups.map((g) => (
              <div key={g.title} className="mb-1.5 last:mb-0">
                <p className="px-5 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-clay">{g.title}</p>
                {g.items.map((item) => {
                  runningIndex += 1;
                  const isActive = runningIndex === active;
                  const myIndex = runningIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={isActive}
                      onMouseEnter={() => setActive(myIndex)}
                      onClick={() => item.run()}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition ${
                        isActive ? 'bg-ink/[0.04]' : 'hover:bg-ink/[0.03]'
                      }`}
                    >
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-ink/5 flex items-center justify-center text-line">
                        {item.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-ink truncate">{item.title}</span>
                        {item.hint && (
                          <span className="block text-xs text-line truncate">{item.hint}</span>
                        )}
                      </span>
                      {isActive && (
                        <kbd className="text-[10px] font-mono text-line bg-ink/5 px-1.5 py-0.5 rounded shrink-0">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function SearchIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 17h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />
    </svg>
  );
}

function CourseDot({ color }) {
  return (
    <span
      className="w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
