import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
  const { authenticated, authLoading, user, isInitialized } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full"></div>
          </div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Check token first
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  
  if (!authenticated || !token) {
    console.log('⚠️ Not authenticated or no token, redirecting to admin login');
    return (
      <Navigate 
        to="/admin/login" 
        replace 
        state={{ from: location.pathname }}
      />
    );
  }

  // Check if user exists and has admin role
  if (!user || user.role !== 'admin') {
    console.log('⚠️ User is not admin or role missing:', user?.role);
    
    // Clear auth data if not admin
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    
    // Show unauthorized message
    toast.error('Unauthorized: Admin access required');
    
    // Redirect to user login if trying to access admin
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;