import { Navigate } from 'react-router-dom'
import { isAuthenticated, getLoginRedirectPath } from '@/lib/auth'
import NeumorphismLogin from '@/component/ui/neumorphism-login'

/**
 * Unified Login Page Component
 * 
 * This component:
 * - Uses the /login route for all users
 * - Redirects authenticated users to their appropriate page based on access level
 * - Shows login form for unauthenticated users
 * - After successful login, users are redirected based on their access level:
 *   - Access level 0 (full admin) -> /dashboard
 *   - Access level 1 (OTP only) -> /otp
 */
export default function LoginPage() {
  // Check if user is already authenticated
  if (isAuthenticated()) {
    // Redirect to appropriate page based on access level
    const redirectPath = getLoginRedirectPath()
    return <Navigate to={redirectPath} replace />
  }

  // Show login form for unauthenticated users
  return <NeumorphismLogin />
}
