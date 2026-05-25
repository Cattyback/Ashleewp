import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    googleLogout();
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-ink text-paper sticky top-0 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true">
            <rect x="2" y="2" width="13" height="13" rx="2" fill="#355355" />
            <rect x="11" y="11" width="13" height="13" rx="2" fill="#a37561" />
          </svg>
          <span className="font-semibold text-[15px] tracking-tight text-paper">WorkPuzzle</span>
        </div>

        <div className="flex items-center gap-3">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-paper/15"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="hidden sm:inline text-sm text-paper/85 max-w-[160px] truncate">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-paper/70 hover:text-paper transition px-3 py-1.5 rounded-md hover:bg-paper/10"
          >
            Sign out
          </button>
        </div>
      </div>
      {/* Warm hairline — a single pixel of clay as architectural accent. */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-clay/60" aria-hidden="true" />
    </header>
  );
}
