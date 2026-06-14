import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const BlockAdminRoute = () => {
  const { user, isAuthenticated } = useAuth()
  const userRole = user?.authorities?.[0]?.authority

  if (isAuthenticated && userRole === 'ADMIN') {
    return <Navigate to="/admin/products" replace />
  }

  return <Outlet />
}

export default BlockAdminRoute