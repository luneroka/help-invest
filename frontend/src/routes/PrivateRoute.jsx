import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PrivateRoute({ children }) {
  const location = useLocation()
  const { user } = useAuth()

  // Pass the attempted URL in state so that Login can redirect back after successful login
  return user ? (
    children
  ) : (
    <Navigate to='/connexion' state={{ from: location.pathname }} />
  )
}

export default PrivateRoute
