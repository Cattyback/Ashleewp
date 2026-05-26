const VARIANT_STYLES = {
  success: {
    accent: 'bg-teal text-paper',
    icon: <CheckIcon />,
  },
  error: {
    accent: 'bg-clay text-paper',
    icon: <AlertIcon />,
  },
  info: {
    accent: 'bg-mist text-paper',
    icon: <InfoIcon />,
  },
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 left-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => {
        const v = VARIANT_STYLES[t.variant] || VARIANT_STYLES.success;
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto wp-toast flex items-center gap-3 bg-surface text-ink rounded-2xl ring-1 ring-ink/8 shadow-float pl-3 pr-2 py-2.5 min-w-[260px] max-w-[380px]"
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${v.accent}`}
              aria-hidden="true"
            >
              {v.icon}
            </span>
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-line hover:text-ink hover:bg-ink/10 transition"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
