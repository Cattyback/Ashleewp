import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

// OAuth scopes:
//   - openid / email / profile → user identity
//   - drive                    → full read+write+delete on the user's Drive
const SCOPES =
  'openid email profile https://www.googleapis.com/auth/drive';

export default function Landing() {
  const { user, login, sessionExpired } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const signIn = useGoogleLogin({
    flow: 'implicit',
    scope: SCOPES,
    onSuccess: async (token) => {
      try {
        const profile = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${token.access_token}` } },
        ).then((r) => r.json());

        login(
          {
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
          },
          token.access_token,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch Google user profile', err);
      }
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Google sign-in failed', err);
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-10">
        <div className="space-y-5">
          <BrandMark />
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-line/70 mb-2">
              v0.1 · early access
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink">
              WorkPuzzle
            </h1>
          </div>
          <p className="text-line text-[15px] leading-relaxed">
            Organize your Google Drive files by course.
            <br />
            Less hunting, more studying.
          </p>
        </div>

        {sessionExpired && (
          <div className="rounded-lg border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-ink text-left">
            <p className="font-medium">Session expired</p>
            <p className="text-line mt-0.5">
              Your Google sign-in lasted about an hour. Sign in again to keep going.
            </p>
          </div>
        )}

        <button
          onClick={() => signIn()}
          className="w-full bg-ink text-paper font-medium py-3 px-6 rounded-lg shadow-sm hover:bg-steel active:scale-[0.99] transition flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="text-xs text-line/80 leading-relaxed">
          WorkPuzzle needs <span className="text-ink font-medium">read &amp; write</span> access to your Google Drive
          so it can organize courses, attach files, and move items to Trash.
        </p>
      </div>
    </div>
  );
}

// Geometric mark — two offset squares, the "puzzle" idea pared down.
function BrandMark() {
  return (
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-surface border border-ink/10 shadow-sm mx-auto">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="2" y="2" width="13" height="13" rx="2" fill="#355355" />
        <rect x="11" y="11" width="13" height="13" rx="2" fill="#a37561" />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.6-1.9 13-5.1l-6-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5c3.3 5.7 9.5 9.4 17.8 9.4z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6 5C40.7 35.1 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
