import { useEffect, useState } from 'react';
import { useCourses } from '../context/CourseContext.jsx';
import { iconForMime } from '../utils/fileIcons.js';
import AttachFilesModal from './AttachFilesModal.jsx';
import RefreshButton from './RefreshButton.jsx';

const COLLAPSE_STORAGE_KEY = 'workpuzzle:courseFiles:collapsed';

export default function CourseFiles() {
  const { courses, loading, setCourseFiles, detachFile, refresh } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // localStorage may be disabled — fail silent.
    }
  }, [collapsed]);

  useEffect(() => {
    if (courses.length === 0) {
      if (selectedCourseId !== '') setSelectedCourseId('');
      return;
    }
    if (!courses.find((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const header = (
    <header className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-clay mb-1">
          Section 02
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Organize files by course</h2>
      </div>
      <RefreshButton onClick={refresh} loading={loading} title="Refresh courses" />
    </header>
  );

  if (courses.length === 0) {
    return (
      <section>
        {header}
        <div className="bg-surface border border-ink/10 rounded-xl p-6 text-sm text-line">
          Add a course first — then come back here to attach files to it.
        </div>
      </section>
    );
  }

  const course = courses.find((c) => c.id === selectedCourseId);
  if (!course) return <section>{header}</section>;

  return (
    <section>
      {header}
      <div className="bg-surface text-ink rounded-xl border border-ink/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/10 flex items-center gap-3 bg-stone/15">
          <label className="text-[11px] uppercase tracking-[0.2em] text-line shrink-0">Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-ink/15 text-sm outline-none focus:border-teal bg-surface text-ink"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `${c.code} — ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: course.color }}
            aria-hidden="true"
          />
        </div>

        <div className="px-5 py-2.5 border-b border-ink/10 flex items-center gap-2 bg-stone/15">
          <CollapseToggle
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
          <span className="text-sm font-medium text-ink/80">
            Files
            <span className="ml-1.5 text-xs text-line">({course.files.length})</span>
          </span>
        </div>

        {!collapsed &&
          (course.files.length === 0 ? (
            <p className="px-5 py-6 text-sm text-line">No files attached yet.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {course.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.02] transition">
                  <span className="text-xl shrink-0" aria-hidden="true">
                    {iconForMime(f.mimeType)}
                  </span>
                  <a
                    href={f.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 text-sm font-medium truncate hover:underline text-ink"
                  >
                    {f.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => detachFile(course.id, f.id)}
                    className="text-xs text-line hover:text-clay transition px-2 py-1 rounded"
                    aria-label={`Unlink ${f.name}`}
                  >
                    Unlink
                  </button>
                </li>
              ))}
            </ul>
          ))}

        <div className="px-5 py-3 border-t border-ink/10 bg-stone/15">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm text-teal font-medium hover:text-steel transition"
          >
            + Add files from Drive
          </button>
        </div>

        <AttachFilesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          currentFiles={course.files}
          onSave={(refs) => setCourseFiles(course.id, refs)}
        />
      </div>
    </section>
  );
}

function CollapseToggle({ collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Expand section' : 'Collapse section'}
      title={collapsed ? 'Expand' : 'Collapse'}
      className="w-6 h-6 rounded-md flex items-center justify-center text-line hover:text-ink hover:bg-ink/10 transition"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform ${collapsed ? '-rotate-90' : ''}`}
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
