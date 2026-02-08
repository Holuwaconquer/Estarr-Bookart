import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const UserRoleChecker = () => {
  const { user, authenticated, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run after auth is loaded
    if (authLoading) return;

    const currentPath = location.pathname;
    
    // If not authenticated and trying to access protected routes
    if (!authenticated) {
      if (currentPath.includes('/dashboard') || currentPath.includes('/admin/')) {
        console.log('🚫 Not authenticated, redirecting to login');
        navigate('/login', { replace: true, state: { from: currentPath } });
      }
      return;
    }

    // If authenticated
    if (user) {
      const userRole = user.role;
      
      // Admin trying to access user dashboard
      if (userRole === 'admin' && currentPath === '/dashboard') {
        console.log('👑 Admin accessing user dashboard, redirecting to admin');
        navigate('/admin/dashboard', { replace: true });
      }
      
      // User trying to access admin dashboard
      if (userRole !== 'admin' && currentPath.includes('/admin/')) {
        console.log('👤 User trying to access admin area, redirecting to user dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authenticated, authLoading, navigate, location]);

  return null; // This component doesn't render anything
};

export default UserRoleChecker;