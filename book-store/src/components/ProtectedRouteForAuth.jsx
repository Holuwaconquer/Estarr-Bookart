import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import PageLoader from './PageLoader';

const ProtectedRouteForAuth = ({ children }) => {
  const { authenticated, authLoading, user, isInitialized } = useContext(AuthContext);
  const location = useLocation();

  // Show loading while auth is initializing
  if (authLoading || !isInitialized) {
    return <PageLoader label="Opening your bookish space" />;
  }

  // If authenticated, DON'T redirect if already on admin login page
  // Only redirect if trying to access login pages while authenticated
  if (authenticated && user) {
    // Check if we're already on a dashboard page
    const currentPath = location.pathname;
    const isOnDashboard = currentPath.includes('/dashboard');
    
    // If already on a dashboard page, stay there (don't redirect)
    if (isOnDashboard) {
      return children;
    }
    
    // Otherwise, redirect to appropriate dashboard
    const requestedPath = new URLSearchParams(location.search).get('next');
    const nextPath = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : null;
    const redirectPath = nextPath || (user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    
    // Don't redirect if we're already going to the right place
    if (currentPath !== redirectPath) {
      console.log(`🔄 Redirecting authenticated user (role: ${user.role}) from ${currentPath} to:`, redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If not authenticated, render the login page
  return children;
};

export default ProtectedRouteForAuth;