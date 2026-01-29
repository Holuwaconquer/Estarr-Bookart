import React from 'react'
import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../AuthContext'

const AdminRoute = ({ children }) => {
  const { authenticated, authLoading, user } = useContext(AuthContext)

  if (authLoading) return null
  if (!authenticated) return <Navigate to="/login" replace />
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default AdminRoute
