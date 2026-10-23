// src/routes/PlatformProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePlatformAuthStore } from '../stores/platformAuthStore';

export const PlatformProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitialized, initialize } = usePlatformAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
