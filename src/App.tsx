// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePlatformAuthStore } from './stores/platformAuthStore';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PlatformProtectedRoute } from './routes/PlatformProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TenantListPage } from './pages/tenants/TenantListPage';
import { TenantRegistrationPage } from './pages/tenants/TenantRegistrationPage';
import { TenantDetailPage } from './pages/tenants/TenantDetailPage';
import { SubscriptionsListPage } from './pages/subscriptions/SubscriptionsListPage';
import { PlansCatalogPage } from './pages/subscriptions/PlansCatalogPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';

export const App: React.FC = () => {
  const { initialize } = usePlatformAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Authenticated Platform Admin Routes */}
        <Route element={<PlatformProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantListPage />} />
            <Route path="/tenants/register" element={<TenantRegistrationPage />} />
            <Route path="/tenants/:id" element={<TenantDetailPage />} />
            <Route path="/subscriptions" element={<SubscriptionsListPage />} />
            <Route path="/plans" element={<PlansCatalogPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
