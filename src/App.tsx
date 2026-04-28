import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import QuestionBank from './pages/QuestionBank';
import Profile from './pages/Profile';
import StudyResourcesPage from './pages/StudyResourcesPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageQuestions from './pages/ManageQuestions';
import ManageTests from './pages/ManageTests';
import ManageUsers from './pages/ManageUsers';

/** Redirects authenticated users away from login/register */
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (profile) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/** Requires authentication to access */
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { profile, loading, isAdmin } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!profile) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth routes (redirect to dashboard if already logged in) */}
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><StudyResourcesPage /></ProtectedRoute>} />
          <Route path="/test/:testId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/question-bank/:category" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute adminOnly><ManageQuestions /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute adminOnly><ManageTests /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
