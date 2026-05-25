import { useEffect, useRef, useState } from 'react';
import { useCourses } from '../context/CourseContext.jsx';

// Course swatches drawn from the brand palette.
const COLORS = [
  { id: 'teal', hex: '#355355' },
  { id: 'clay', hex: '#a37561' },
  { id: 'mist', hex: '#63869a' },
  { id: 'slate', hex: '#485a65' },
  { id: 'stone', hex: '#9e8c84' },
  { id: 'rose', hex: '#d4b3b2' },
];

export default function AddCourseModal({ open, onClose }) {
  const { addCourse } = useCourses();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState(COLORS[0].hex);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setCode('');
    setInstructor('');
    setColor(COLORS[0].hex);
    queueMicrotask(() => nameInputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCourse({ name, code, instructor, color });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-surface text-ink rounded-xl border border-ink/10 shadow-xl w-full max-w-md p-6 space-y-5"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-line/70 mb-1">
            New course
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Add a course</h2>
          <p className="text-sm text-line mt-1">
            You can edit or delete this later.
          </p>
        </div>

        <Field label="Course name *">
          <input
            ref={nameInputRef}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Intro to Computer Science"
            className="wp-input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Code">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CS101"
              className="wp-input"
            />
          </Field>
          <Field label="Instructor">
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Prof. Smith"
              className="wp-input"
            />
          </Field>
        </div>

        <Field label="Color">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.id}
                className={`w-8 h-8 rounded-md transition ${
                  color === c.hex
                    ? 'ring-2 ring-offset-2 ring-ink/80 ring-offset-surface'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-line hover:text-ink hover:bg-ink/5 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-ink text-paper font-medium hover:bg-steel transition disabled:opacity-50"
            disabled={!name.trim()}
          >
            Save course
          </button>
        </div>
      </form>

      <style>{`
        .wp-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: #ffffff;
          color: #2f2e2a;
          border: 1px solid rgba(47,46,42,0.15);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 120ms;
        }
        .wp-input:focus { border-color: #355355; }
        .wp-input::placeholder { color: rgba(84,97,106,0.7); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.2em] text-line mb-1.5">{label}</span>
      {children}
    </label>
  );
}
