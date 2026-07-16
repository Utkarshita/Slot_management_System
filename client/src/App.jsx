import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import BookingPage from './pages/BookingPage';
import CalendarPage from './pages/CalendarPage';
import EditSlotsPage from './pages/EditSlotsPage';

// ── Protected Route ────────────────────────────────────────────────────────────
// Checks localStorage for a valid user + JWT token before rendering faculty pages.
// If missing, redirects back to login.
function ProtectedRoute({ children, requiredRole }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/" replace />;

  const user = JSON.parse(userStr);
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  if (user.role === 'faculty' && !user.token) {
    // Faculty must have a JWT token — if missing, force re-login
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  return children;
}

// Shared layout wrapper for logged-in pages
function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Branding Header */}
      <div className="branding-header">
        <div className="branding-logo-left">
          <img src="/Group 5.png" alt="Somaiya Logo" />
        </div>
        <h1 className="branding-title">KJ SOMAIYA COLLEGE OF ENGINEERING</h1>
        <div className="branding-logo-right">
          <img src="/Group 7307.png" alt="Somaiya Logo" />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 Slot Management System. All rights reserved.</p>
        <p>
          Contact us:{' '}
          <a href="mailto:support@slotmanagement.com" style={{ color: 'hsl(351, 71%, 95%)' }}>
            support@slotmanagement.com
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />

          {/* Faculty-only protected routes */}
          <Route path="/faculty" element={
            <ProtectedRoute requiredRole="faculty"><FacultyDashboard /></ProtectedRoute>
          } />
          <Route path="/booking/:year/:type" element={
            <ProtectedRoute requiredRole="faculty"><BookingPage /></ProtectedRoute>
          } />
          <Route path="/calendar/:year/:type" element={
            <CalendarPage />
          } />
          <Route path="/edit/:year/:type" element={
            <ProtectedRoute requiredRole="faculty"><EditSlotsPage /></ProtectedRoute>
          } />
        </Routes>
      </AppLayout>
    </Router>
  );
}
