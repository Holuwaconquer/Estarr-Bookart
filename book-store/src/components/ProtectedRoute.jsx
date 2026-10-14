import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import PageLoader from './PageLoader'

const ProtectedRoute = ({ children }) => {
  const { authenticated, authLoading, isInitialized, user } = useContext(AuthContext)
  const location = useLocation()

  // Show loading while auth is initializing
  if (authLoading || !isInitialized) {
    return <PageLoader label="Preparing your reading space" />
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  // Keep admins out of the user dashboard, but allow them to shop and checkout.
  if (user && user.role === 'admin' && location.pathname.startsWith('/dashboard')) {
    console.log('⚠️ Admin tried to access user dashboard, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />
  }

  // Render children if authenticated user
  return children
}

export default ProtectedRoute