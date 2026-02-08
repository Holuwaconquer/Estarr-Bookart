import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ProtectedRouteForAuth = ({ children }) => {
  const { authenticated, authLoading, user, isInitialized } = useContext(AuthContext);
  const location = useLocation();

  // Show loading while auth is initializing
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full"></div>
          </div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
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
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    
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