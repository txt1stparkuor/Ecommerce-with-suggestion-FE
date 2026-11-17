import React from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import OrderManagement from '../pages/Admin/OrderManagement/OrderManagement'
import ProductManagement from '../pages/Admin/ProductManagement/ProductManagement'
import UserManagement from '../pages/Admin/UserManagement/UserManagement'
import AnalyticsDashboard from '../pages/Admin/AnalyticsDashboard/AnalyticsDashboard'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'

const adminRoutes = [
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/analytics" replace />,
          },
          {
            path: 'analytics',
            element: <AnalyticsDashboard />,
          },
          {
            path: 'products',
            element: <ProductManagement />,
          },
          {
            path: 'orders',
            element: <OrderManagement />,
          },
          {
            path: 'users',
            element: <UserManagement />,
          },
        ],
      },
    ],
  },
]

export default adminRoutes
