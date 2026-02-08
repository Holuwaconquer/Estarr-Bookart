import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'

const ProtectedRoute = ({ children }) => {
  const { authenticated, authLoading, isInitialized, user } = useContext(AuthContext)

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
    )
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // Prevent admins from accessing user dashboard
  if (user && user.role === 'admin') {
    console.log('⚠️ Admin tried to access user dashboard, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />
  }

  // Render children if authenticated user
  return children
}

export default ProtectedRoute