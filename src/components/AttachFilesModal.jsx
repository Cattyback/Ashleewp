import { useEffect, useMemo, useState } from 'react';
import useDriveFiles from '../hooks/useDriveFiles.js';
import { iconForMime } from '../utils/fileIcons.js';
import { SkeletonRowList } from './Skeleton.jsx';

export default function AttachFilesModal({ open, onClose, currentFiles, onSave }) {
  const { files: driveFiles, loading, error } = useDriveFiles();
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(currentFiles.map((f) => f.id)));
    setQuery('');
  }, [open, currentFiles]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const merged = useMemo(() => {
    const byId = new Map();
    for (const f of driveFiles) byId.set(f.id, f);
    for (const f of currentFiles) if (!byId.has(f.id)) byId.set(f.id, f);
    const all = Array.from(byId.values());
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((f) => f.name.toLowerCase().includes(q));
  }, [driveFiles, currentFiles, query]);

  if (!open) return null;

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const byId = new Map(merged.map((f) => [f.id, f]));
    const refs = Array.from(selectedIds)
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        iconLink: f.iconLink,
        webViewLink: f.webViewLink,
      }));
    onSave(refs);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface text-ink rounded-3xl ring-1 ring-ink/8 shadow-float w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-ink/10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-line/70 mb-1">
            File picker
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Attach files from Drive</h2>
          <p className="text-sm text-line mt-1">
            Pick the files that belong to this course. Unchecking unlinks them.
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="mt-3 w-full px-4 py-2 rounded-full border border-ink/12 bg-paper/40 text-sm outline-none focus:border-teal focus:bg-surface placeholder:text-line/70"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <SkeletonRowList count={5} />}
          {error && (
            <p className="p-5 text-sm text-clay">
              Couldn't load Drive files: {error.message}
            </p>
          )}
          {!loading && !error && merged.length === 0 && (
            <p className="p-5 text-sm text-line">
              {query ? 'No files match that search.' : 'No files in your Drive yet.'}
            </p>
          )}
          {!loading && !error && merged.length > 0 && (
            <ul className="divide-y divide-ink/5">
              {merged.map((f) => {
                const checked = selectedIds.has(f.id);
                return (
                  <li key={f.id}>
                    <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ink/[0.03] transition">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(f.id)}
                        className="w-4 h-4 shrink-0 accent-[#355355]"
                      />
                      <span className="text-xl shrink-0" aria-hidden="true">
                        {iconForMime(f.mimeType)}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-sm text-ink">
                        {f.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-ink/10 flex items-center justify-between bg-paper/40">
          <span className="text-xs text-line font-mono">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-line hover:text-ink hover:bg-ink/5 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-ink text-paper font-medium hover:bg-steel shadow-soft transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
