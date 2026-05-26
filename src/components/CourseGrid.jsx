import { useCourses } from '../context/CourseContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import CourseCard from './CourseCard.jsx';
import AddCourseModal from './AddCourseModal.jsx';
import RefreshButton from './RefreshButton.jsx';
import { SkeletonCourseGrid } from './Skeleton.jsx';
import { EmptyCoursesIllustration } from './EmptyIllustration.jsx';

export default function CourseGrid() {
  const { courses, loading, refresh } = useCourses();
  const { addCourseOpen, openAddCourse, closeAddCourse } = useUI();

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
        <SkeletonCourseGrid count={6} />
      ) : courses.length === 0 ? (
        <EmptyState onAdd={openAddCourse} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          <AddAnotherTile onAdd={openAddCourse} />
        </div>
      )}

      <AddCourseModal open={addCourseOpen} onClose={closeAddCourse} />
    </section>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-surface rounded-2xl ring-1 ring-ink/8 shadow-soft px-6 py-10 flex flex-col items-center text-center">
      <EmptyCoursesIllustration />
      <h3 className="font-semibold text-base text-ink mt-4">No courses yet</h3>
      <p className="text-sm text-line mt-1.5 max-w-xs">
        Add your first course to start organizing Drive files by class.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-steel shadow-soft transition inline-flex items-center gap-2"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New course
      </button>
      <p className="mt-3 text-[11px] text-line/70">
        Tip: press <kbd className="font-mono bg-ink/5 px-1.5 py-0.5 rounded ring-1 ring-ink/10">N</kbd> anytime
      </p>
    </div>
  );
}

function AddAnotherTile({ onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-2xl border-2 border-dashed border-stone/40 bg-stone/10 text-line hover:text-clay hover:border-clay/50 hover:bg-stone/20 transition min-h-[140px] flex items-center justify-center text-sm font-medium"
    >
      + Add another course
    </button>
  );
}
