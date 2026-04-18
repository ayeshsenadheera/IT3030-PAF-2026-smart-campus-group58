import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'


export default function TechnicianBlockRoute() {
  const { isTechnician, isAdmin } = useAuth()
  
  if (isTechnician() && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
