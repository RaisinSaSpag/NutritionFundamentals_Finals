import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AccessibilitySkipLink } from './components/AccessibilitySkipLink';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ConsumerDashboardPage } from './pages/ConsumerDashboardPage';
import { MealLoggingPage } from './pages/MealLoggingPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { TelehealthSessionPage } from './pages/TelehealthSessionPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { ConsumerClinicalDetailPage } from './pages/ConsumerClinicalDetailPage';
import { AdimeCarePlanViewPage } from './pages/AdimeCarePlanViewPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Array<'CONSUMER' | 'PROVIDER'>;
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'PROVIDER' ? '/provider' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Home Redirect
const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'PROVIDER' ? '/provider' : '/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <AccessibilitySkipLink />
          <Navbar />

          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Home Redirect */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Consumer Only Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CONSUMER']}>
                    <ConsumerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meals/log"
                element={
                  <ProtectedRoute allowedRoles={['CONSUMER']}>
                    <MealLoggingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/book"
                element={
                  <ProtectedRoute allowedRoles={['CONSUMER']}>
                    <BookAppointmentPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Only Routes */}
              <Route
                path="/provider"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER']}>
                    <ProviderDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/consumers/:consumerId"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER']}>
                    <ConsumerClinicalDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/telehealth/:id"
                element={
                  <ProtectedRoute>
                    <TelehealthSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/careplan/:chartId"
                element={
                  <ProtectedRoute>
                    <AdimeCarePlanViewPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
