import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'
import OTP from '../OTP'

interface OTPRouteProps {
  onLogout?: () => void
}

export default function OTPRoute({ onLogout }: OTPRouteProps) {
  // Check authentication
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  // OTP is accessible to all authenticated users (no admin check needed)
  return <OTP onLogout={onLogout} />
}
