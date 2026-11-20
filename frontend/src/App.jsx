import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import PublicNav from './components/layout/PublicNav';
import Footer from './components/layout/Footer';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DatasetManagement from './pages/admin/DatasetManagement';
import ModelManagement from './pages/admin/ModelManagement';
import ModelEvaluation from './pages/admin/ModelEvaluation';
import PredictionMonitoring from './pages/admin/PredictionMonitoring';
import SystemReports from './pages/admin/SystemReports';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex-1 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Landing />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/features"
        element={
          <PublicLayout>
            <Features />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />

      {/* User Application Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prediction"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Prediction />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Administrator Application Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AppLayout>
              <UserManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/datasets"
        element={
          <AdminRoute>
            <AppLayout>
              <DatasetManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/models"
        element={
          <AdminRoute>
            <AppLayout>
              <ModelManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/evaluation"
        element={
          <AdminRoute>
            <AppLayout>
              <ModelEvaluation />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <AdminRoute>
            <AppLayout>
              <PredictionMonitoring />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AppLayout>
              <SystemReports />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminSettings />
            </AppLayout>
          </AdminRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

