import React from 'react'
import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../AuthContext'

const ProtectedRoute = ({ children }) => {
  const { authenticated, authLoading } = useContext(AuthContext)

  if (authLoading) return null
  if (!authenticated) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
