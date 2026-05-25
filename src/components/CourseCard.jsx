import { useEffect, useRef, useState } from 'react';
import { useCourses } from '../context/CourseContext.jsx';

// Same swatches as AddCourseModal — kept in sync visually.
const COLORS = [
  { id: 'teal', hex: '#355355' },
  { id: 'clay', hex: '#a37561' },
  { id: 'mist', hex: '#63869a' },
  { id: 'slate', hex: '#485a65' },
  { id: 'stone', hex: '#9e8c84' },
  { id: 'rose', hex: '#d4b3b2' },
];

export default function CourseCard({ course }) {
  const { deleteCourse, setCourseColor } = useCourses();
  const [confirming, setConfirming] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    deleteCourse(course.id);
  };

  // Outside click + Escape close the color picker.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  return (
    <article className="group relative bg-surface text-ink rounded-xl border border-ink/10 hover:border-ink/25 transition min-h-[140px] overflow-visible">
      {/* Color accent stripe on the left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: course.color }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-4 py-5 h-full flex flex-col justify-between">
        <div className="min-w-0">
          {course.code && (
            <p className="text-[10px] font-medium text-line uppercase tracking-[0.2em]">
              {course.code}
            </p>
          )}
          <h3 className="font-semibold text-[15px] truncate mt-1 text-ink">{course.name}</h3>
          {course.instructor && (
            <p className="text-sm text-line mt-1 truncate">
              {course.instructor}
            </p>
          )}
        </div>

        {course.folderLink && (
          <a
            href={course.folderLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-line hover:text-teal transition w-fit"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M1.5 3.5v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6L4.5 1.5h-2a1 1 0 0 0-1 1z" />
            </svg>
            <span>Open in Drive</span>
          </a>
        )}
      </div>

      {/* Hover actions — color swatch + delete */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            title="Change color"
            aria-label="Change course color"
            aria-haspopup="true"
            aria-expanded={pickerOpen}
            className={`w-6 h-6 rounded-md border border-ink/15 hover:border-ink/40 transition flex items-center justify-center ${
              pickerOpen ? 'opacity-100 border-ink/40' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
            }`}
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: course.color }}
              aria-hidden="true"
            />
          </button>

          {pickerOpen && (
            <div
              role="dialog"
              aria-label="Pick a color"
              className="absolute top-full right-0 mt-1.5 z-20 bg-surface border border-ink/10 rounded-lg shadow-lg p-2 flex gap-1.5"
            >
              {COLORS.map((c) => {
                const selected = c.hex.toLowerCase() === (course.color || '').toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCourseColor(course.id, c.hex);
                      setPickerOpen(false);
                    }}
                    title={c.id}
                    aria-label={c.id}
                    aria-pressed={selected}
                    className={`w-6 h-6 rounded-md transition ${
                      selected
                        ? 'ring-2 ring-ink/80 ring-offset-2 ring-offset-surface'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          title={confirming ? 'Click again to confirm' : 'Delete course'}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition ${
            confirming
              ? 'bg-clay text-paper opacity-100'
              : 'bg-ink/5 text-line hover:bg-ink/10 hover:text-ink opacity-0 group-hover:opacity-100 focus:opacity-100'
          }`}
        >
          {confirming ? '✓' : '✕'}
        </button>
      </div>
    </article>
  );
}
