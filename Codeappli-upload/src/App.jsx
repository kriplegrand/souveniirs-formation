import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LessonsPage from './pages/LessonsPage';
import ChaptersPage from './pages/ChaptersPage';
import CoachDashboard from './pages/CoachDashboard';
import StudentDetails from './pages/StudentDetails';
import AdminContentPage from './pages/AdminContentPage';
import FirstLoginPage from './pages/FirstLoginPage';
import AccessExpiredPage from './pages/AccessExpiredPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.first_login && user.role === 'student') {
    return <Navigate to="/first-login" replace />;
  }

  if (user.status !== 'active' && user.role === 'student') {
    return <Navigate to="/access-expired" replace />;
  }
  
  if (requiredRole) {
    const hasPermission = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;
    if (!hasPermission) {
      return <Navigate to="/lessons" replace />;
    }
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/lessons" replace /> : <LoginPage />} 
      />
      <Route 
        path="/first-login" 
        element={user && user.first_login ? <FirstLoginPage /> : <Navigate to="/lessons" />}
      />
      <Route 
        path="/access-expired"
        element={<AccessExpiredPage />}
      />
      <Route 
        path="/lessons" 
        element={
          <ProtectedRoute>
            <LessonsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chapters" 
        element={
          <ProtectedRoute>
            <ChaptersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/coach" 
        element={
          <ProtectedRoute requiredRole={['coach', 'supercoach']}>
            <CoachDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/coach/student/:studentId" 
        element={
          <ProtectedRoute requiredRole={['coach', 'supercoach']}>
            <StudentDetails />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/admin/content" 
        element={
          <ProtectedRoute requiredRole={['coach', 'supercoach']}>
            <AdminContentPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole={['coach', 'supercoach']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/analytics" 
        element={
          <ProtectedRoute requiredRole={['coach', 'supercoach']}>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/lessons" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const favicon = localStorage.getItem('app_favicon');
    if (favicon) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = favicon;
        document.head.appendChild(newLink);
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Souveniirs Formation - Plateforme d'apprentissage autobiographique</title>
        <meta name="description" content="Apprenez à rédiger votre autobiographie avec notre méthode structurée et un accompagnement personnalisé." />
      </Helmet>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
