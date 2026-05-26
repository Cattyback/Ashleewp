import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const { openShortcutsHelp, openWhatWeAccess } = useUI();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    googleLogout();
    logout();
    navigate('/', { replace: true });
  };

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-paper/10 transition"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt=""
            className="w-7 h-7 rounded-full ring-1 ring-paper/20"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-paper/15 text-paper text-xs font-medium flex items-center justify-center">
            {user.name?.[0]?.toUpperCase() || '?'}
          </span>
        )}
        <span className="hidden sm:inline text-sm text-paper/85 max-w-[120px] truncate">
          {user.name}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" className="text-paper/60" aria-hidden="true">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-30 w-64 bg-surface text-ink rounded-2xl ring-1 ring-ink/8 shadow-float py-1.5 overflow-hidden"
        >
          <div className="px-3.5 py-2.5 border-b border-ink/8">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-line truncate mt-0.5">{user.email}</p>
          </div>

          <MenuItem onClick={() => { setOpen(false); openShortcutsHelp(); }} icon={<KbdIcon />} shortcut="?">
            Keyboard shortcuts
          </MenuItem>
          <MenuItem onClick={() => { setOpen(false); openWhatWeAccess(); }} icon={<ShieldIcon />}>
            What we access
          </MenuItem>

          <div className="h-px bg-ink/8 my-1" />

          <MenuItem onClick={handleSignOut} icon={<SignOutIcon />} variant="danger">
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, icon, shortcut, variant, children }) {
  const danger = variant === 'danger';
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition ${
        danger ? 'text-clay hover:bg-clay/10' : 'text-ink hover:bg-ink/5'
      }`}
    >
      <span className={`shrink-0 w-4 h-4 flex items-center justify-center ${danger ? 'text-clay' : 'text-line'}`}>
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {shortcut && <kbd className="text-[10px] font-mono text-line bg-ink/5 px-1.5 py-0.5 rounded">{shortcut}</kbd>}
    </button>
  );
}

function KbdIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}
