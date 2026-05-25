import { useState } from 'react';
import { useCourses } from '../context/CourseContext.jsx';
import CourseCard from './CourseCard.jsx';
import AddCourseModal from './AddCourseModal.jsx';
import RefreshButton from './RefreshButton.jsx';

export default function CourseGrid() {
  const { courses, loading, refresh } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section>
      <header className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-clay mb-1">
            Section 01
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Your courses</h2>
        </div>
        <RefreshButton onClick={refresh} loading={loading} title="Refresh courses" />
      </header>

      {loading ? (
        <div className="text-line text-sm bg-surface border border-ink/10 rounded-xl px-5 py-4">
          Loading your courses…
        </div>
      ) : courses.length === 0 ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          <AddAnotherTile onAdd={() => setModalOpen(true)} />
        </div>
      )}

      <AddCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={onAdd}
        className="bg-stone/15 text-ink rounded-xl p-5 hover:bg-stone/25 hover:border-clay/50 transition border border-dashed border-stone/50 min-h-[140px] flex flex-col items-start justify-between text-left"
      >
        <div>
          <h3 className="font-semibold text-base">Add your first course</h3>
          <p className="text-sm text-line mt-1">
            Click here to fill out a quick form.
          </p>
        </div>
        <span className="mt-4 text-sm text-clay font-medium">+ New course</span>
      </button>
    </div>
  );
}

function AddAnotherTile({ onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-xl border border-dashed border-stone/50 bg-stone/10 text-line hover:text-clay hover:border-clay/50 hover:bg-stone/20 transition min-h-[140px] flex items-center justify-center text-sm font-medium"
    >
      + Add another course
    </button>
  );
}
