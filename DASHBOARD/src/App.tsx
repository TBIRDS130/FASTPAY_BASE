import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated, getLoginRedirectPath, syncThemeFromBackend } from '@/lib/auth'
import { Toaster } from '@/component/ui/toaster'
// Import user access utility (makes it available in browser console)
import '@/utils/updateUserAccess'
// Initialize Django API logger to start intercepting API calls
import '@/lib/django-api-logger'

// Lazy load route components for code splitting
const DashboardRoute = lazy(() => import('@/pages/dashboard/DashboardRoute'))
const OTPRoute = lazy(() => import('@/pages/otp/OTPRoute'))
const GmailCallback = lazy(() => import('@/pages/auth/GmailCallback'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RedPayRoute = lazy(() => import('@/pages/redpay/RedPayRoute'))
const KyPayRoute = lazy(() => import('@/pages/kypay/KyPayRoute'))
const DjangoRoute = lazy(() => import('@/pages/django/DjangoRoute'))

// Loading fallback component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = isAuthenticated()
    setIsLoggedIn(authenticated)
    if (authenticated) {
      syncThemeFromBackend()
    }

  }, [])

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const basePath = import.meta.env.BASE_URL || '/'

  return (
    <BrowserRouter basename={basePath}>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* OTP page - requires authentication */}
          <Route path="/otp" element={<OTPRoute onLogout={handleLogout} />} />

          {/* Dashboard - requires authentication (all users can access, features gated by admin status) */}
          <Route path="/dashboard" element={<DashboardRoute onLogout={handleLogout} />} />
          
          {/* RedPay - requires authentication (admin only) */}
          <Route path="/redpay" element={<RedPayRoute onLogout={handleLogout} />} />
          
          {/* KyPay - requires authentication (admin only) */}
          <Route path="/kypay" element={<KyPayRoute onLogout={handleLogout} />} />

          {/* Django API Logs - requires authentication (admin only) */}
          <Route path="/django" element={<DjangoRoute onLogout={handleLogout} />} />

          {/* Gmail OAuth Callback - requires authentication */}
          <Route path="/auth/google/callback" element={<GmailCallback />} />

          {/* Login - unified login page for all users */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Neumorphism legacy paths - redirect to dashboard */}
          <Route path="/neumorphism/*" element={<Navigate to="/dashboard" replace />} />

          {/* Root path - redirects based on authentication status */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to={getLoginRedirectPath()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
