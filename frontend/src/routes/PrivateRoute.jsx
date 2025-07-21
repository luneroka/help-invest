import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

function PrivateRoute({ children }) {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    // Show a loading spinner or message while auth state is being determined
    return <div>Chargement...</div>
  }

  // Only redirect if loading is false and user is not authenticated
  return user ? (
    children
  ) : (
    <Navigate to='/connexion' state={{ from: location.pathname }} />
  )
}

export default PrivateRoute
