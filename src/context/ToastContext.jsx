import { createContext, useCallback, useContext, useRef, useState } from 'react';
import ToastContainer from '../components/ToastContainer.jsx';

const ToastContext = createContext(null);
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, opts = {}) => {
      const id = ++idRef.current;
      const variant = opts.variant || 'success';
      const duration = opts.duration ?? DEFAULT_DURATION;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const api = {
    success: (msg, opts) => push(msg, { ...opts, variant: 'success' }),
    error: (msg, opts) => push(msg, { ...opts, variant: 'error' }),
    info: (msg, opts) => push(msg, { ...opts, variant: 'info' }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
