import { useNavigate, Navigate } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { isAuthenticated } from '@/lib/auth'

/**
 * Complete Neumorphic Dashboard Wrapper
 * 
 * This component wraps the main Dashboard with neumorphic styling,
 * providing a complete dashboard experience with soft UI design.
 * 
 * STRUCTURE SYNC: This uses the exact same Dashboard component as /dashboard,
 * ensuring both routes have identical structure, features, and functionality.
 * Only the styling differs - neumorphic design vs standard theme.
 */
export default function NeumorphismDashboardComplete() {
  const navigate = useNavigate()
  
  // Check authentication
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="neu-dashboard-wrapper">
      <Dashboard onLogout={handleLogout} />
    </div>
  )
}
