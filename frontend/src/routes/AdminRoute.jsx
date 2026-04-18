import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
