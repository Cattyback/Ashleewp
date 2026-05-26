/*
 * Skeleton primitives — shimmering placeholders that mirror the shape of
 * the real content they replace. Animation comes from the `.wp-skeleton`
 * class defined in index.css (a slow left-to-right sweep).
 */

function Bar({ className = '' }) {
  return <div className={`wp-skeleton rounded-full ${className}`} />;
}

/* Matches CourseCard: 140px-min card with left color stripe and two text lines. */
export function SkeletonCourseCard() {
  return (
    <article className="relative bg-surface rounded-2xl ring-1 ring-ink/8 shadow-soft min-h-[140px] overflow-hidden">
      <div className="wp-skeleton absolute left-0 top-0 bottom-0 w-1" />
      <div className="pl-5 pr-4 py-5 h-full flex flex-col justify-between">
        <div className="space-y-2.5">
          <Bar className="h-2 w-16" />
          <Bar className="h-3.5 w-3/4" />
          <Bar className="h-2.5 w-1/2" />
        </div>
        <Bar className="h-2.5 w-20" />
      </div>
    </article>
  );
}

/* Matches a FileList row: icon dot + title + meta line, padded the same. */
export function SkeletonFileRow() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="wp-skeleton w-6 h-6 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Bar className="h-3 w-2/3" />
        <Bar className="h-2.5 w-1/3" />
      </div>
    </li>
  );
}

export function SkeletonCourseGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCourseCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRowList({ count = 5 }) {
  return (
    <ul className="divide-y divide-ink/5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFileRow key={i} />
      ))}
    </ul>
  );
}
