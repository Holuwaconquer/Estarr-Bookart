import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

/**
 * ProtectedRouteForAuth - Only allows unauthenticated users
 * Used for Login, Register, Reset Password pages
 * Redirects authenticated users to dashboard
 */
const ProtectedRouteForAuth = ({ children }) => {
  const { authenticated, authLoading } = useContext(AuthContext);

  // Show nothing while loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the page
  return children;
};

export default ProtectedRouteForAuth;
