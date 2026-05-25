export default function RefreshButton({ onClick, loading, title = 'Refresh' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-md flex items-center justify-center text-line hover:text-ink hover:bg-ink/5 transition disabled:opacity-50 disabled:cursor-wait"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={loading ? 'animate-spin' : ''}
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    </button>
  );
}
