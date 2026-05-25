import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Auth guard: bounces unauthenticated users back to the landing page.
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all: anything unknown → landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
