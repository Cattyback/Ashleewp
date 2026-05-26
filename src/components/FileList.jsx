import { useState } from 'react';
import useDriveFiles from '../hooks/useDriveFiles.js';
import { useCourses } from '../context/CourseContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { iconForMime } from '../utils/fileIcons.js';
import RefreshButton from './RefreshButton.jsx';
import { SkeletonFileRow } from './Skeleton.jsx';
import { EmptyFilesIllustration } from './EmptyIllustration.jsx';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export default function FileList() {
  const { files, loading, error, refresh, trashFile } = useDriveFiles();
  const { onDriveFileTrashed } = useCourses();
  const toast = useToast();
  const handleTrash = async (fileId) => {
    const target = files.find((f) => f.id === fileId);
    try {
      await trashFile(fileId);
      onDriveFileTrashed(fileId);
      toast.success(`Moved "${target?.name ?? 'file'}" to Trash`);
    } catch (err) {
      toast.error(`Couldn't delete: ${err.message}`);
      throw err;
    }
  };
  const [tab, setTab] = useState('documents');
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const header = (
    <header className="flex items-baseline justify-between mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-clay mb-1">
          Section 03
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Recent files</h2>
      </div>
      <RefreshButton onClick={refresh} loading={loading} title="Refresh Drive files" />
    </header>
  );

  if (loading) {
    return (
      <section>
        {header}
        <div className="bg-surface text-ink rounded-2xl ring-1 ring-ink/8 shadow-soft overflow-hidden">
          <div className="px-4 py-3 border-b border-ink/10 bg-stone/15">
            <div className="wp-skeleton h-9 w-full rounded-full" />
          </div>
          <ul className="divide-y divide-ink/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonFileRow key={i} />
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        {header}
        <div className="text-sm text-ink bg-clay/10 ring-1 ring-clay/40 shadow-soft rounded-2xl p-4">
          Couldn't load Drive files: {error.message}
        </div>
      </section>
    );
  }

  if (files.length === 0) {
    return (
      <section>
        {header}
        <div className="bg-surface ring-1 ring-ink/8 shadow-soft rounded-2xl px-6 py-10 flex flex-col items-center text-center">
          <EmptyFilesIllustration />
          <h3 className="font-semibold text-base text-ink mt-4">Your Drive looks empty</h3>
          <p className="text-sm text-line mt-1.5 max-w-sm">
            Add a file to your Google Drive and it'll appear here. Press <kbd className="font-mono text-xs bg-ink/5 px-1.5 py-0.5 rounded ring-1 ring-ink/10">R</kbd> to refresh.
          </p>
        </div>
      </section>
    );
  }

  const q = query.trim().toLowerCase();
  const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
  const toMs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;
  const hasFilter = Boolean(q || fromMs || toMs);

  const matches = files.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (fromMs || toMs) {
      const t = f.modifiedTime ? new Date(f.modifiedTime).getTime() : NaN;
      if (Number.isNaN(t)) return false;
      if (fromMs && t < fromMs) return false;
      if (toMs && t > toMs) return false;
    }
    return true;
  });
  const folders = matches.filter((f) => f.mimeType === FOLDER_MIME);
  const documents = matches.filter((f) => f.mimeType !== FOLDER_MIME);
  const items = tab === 'folders' ? folders : documents;

  return (
    <section>
      {header}
      <div className="bg-surface text-ink rounded-2xl ring-1 ring-ink/8 shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-ink/10 space-y-2 bg-stone/15">
          <SearchInput value={query} onChange={setQuery} />
          <DateRangeFilter
            from={fromDate}
            to={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
        </div>
        <div role="tablist" className="flex border-b border-ink/10 bg-stone/15">
          <TabButton
            active={tab === 'documents'}
            count={documents.length}
            onClick={() => setTab('documents')}
          >
            Documents
          </TabButton>
          <TabButton
            active={tab === 'folders'}
            count={folders.length}
            onClick={() => setTab('folders')}
          >
            Folders
          </TabButton>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-line">
            {hasFilter
              ? `No ${tab} match your filters.`
              : tab === 'folders'
                ? 'No folders.'
                : 'No documents.'}
          </p>
        ) : (
          <ul className="divide-y divide-ink/5">
            {items.map((file) => (
              <FileRow key={file.id} file={file} onTrash={handleTrash} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FileRow({ file, onTrash }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onTrash(file.id);
    } catch (err) {
      setBusy(false);
      setConfirming(false);
      setError(err);
    }
  };

  return (
    <li className="group flex items-center gap-2 hover:bg-ink/[0.03] transition">
      <a
        href={file.webViewLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3"
      >
        <span className="text-xl shrink-0" aria-hidden="true">
          {iconForMime(file.mimeType)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-ink text-[14px]">{file.name}</p>
          <p className="text-xs text-line mt-0.5">
            {error ? (
              <span className="text-clay">Delete failed: {error.message}</span>
            ) : (
              <>Modified {formatDate(file.modifiedTime)}</>
            )}
          </p>
        </div>
      </a>

      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        title={
          busy
            ? 'Moving to Trash…'
            : confirming
              ? 'Click again to confirm'
              : 'Move to Trash'
        }
        aria-label={confirming ? 'Confirm move to Trash' : 'Move to Trash'}
        className={`mr-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait disabled:opacity-100 ${
          confirming
            ? 'bg-clay text-paper opacity-100'
            : 'text-line hover:text-clay hover:bg-clay/10'
        }`}
      >
        {busy ? '…' : confirming ? '✓' : <TrashIcon />}
      </button>
    </li>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-line"
        aria-hidden="true"
      >
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files…"
        aria-label="Search files"
        className="w-full pl-9 pr-9 py-2 text-sm bg-paper/60 border border-transparent rounded-full placeholder:text-clay text-ink focus:outline-none focus:bg-surface focus:border-teal/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-line hover:text-ink hover:bg-ink/10 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}

function DateRangeFilter({ from, to, onFromChange, onToChange }) {
  const hasValue = Boolean(from || to);
  return (
    <div className="flex items-center gap-2 text-xs text-line">
      <span className="shrink-0 uppercase tracking-[0.18em] text-[10px]">Modified</span>
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label="Modified from"
        className="flex-1 min-w-0 px-2 py-1.5 bg-paper/60 border border-transparent rounded-lg text-ink focus:outline-none focus:bg-surface focus:border-teal/40"
      />
      <span className="shrink-0 text-line/60">→</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onToChange(e.target.value)}
        aria-label="Modified to"
        className="flex-1 min-w-0 px-2 py-1.5 bg-paper/60 border border-transparent rounded-lg text-ink focus:outline-none focus:bg-surface focus:border-teal/40"
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => {
            onFromChange('');
            onToChange('');
          }}
          aria-label="Clear date filter"
          className="shrink-0 w-6 h-6 rounded-full text-line hover:text-ink hover:bg-ink/10 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function TabButton({ active, count, children, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 border-b-2 ${
        active
          ? 'border-teal text-ink bg-surface'
          : 'border-transparent text-line hover:text-ink hover:bg-surface/60'
      }`}
    >
      <span>{children}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
          active ? 'bg-teal/10 text-teal' : 'bg-ink/10 text-line'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
