import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CourseProvider } from './context/CourseContext.jsx';
import './index.css';

// Google OAuth Client ID is read from .env at build time.
// VITE_GOOGLE_CLIENT_ID must be defined or the sign-in button will fail.
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  // eslint-disable-next-line no-console
  console.warn(
    '[WorkPuzzle] VITE_GOOGLE_CLIENT_ID is missing. Copy .env.example to .env and add your Client ID.',
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <CourseProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </CourseProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
