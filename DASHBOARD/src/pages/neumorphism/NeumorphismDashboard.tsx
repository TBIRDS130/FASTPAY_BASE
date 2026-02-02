import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import NeumorphismDashboardComplete from './NeumorphismDashboardComplete'
import { 
  MessageSquare, 
  User, 
  LogOut, 
  Activity, 
  UserRound, 
  SlidersHorizontal, 
  Mail, 
  Wrench, 
  CreditCard,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { getSession, clearSession, getUserAccess, isAuthenticated } from '@/lib/auth'

// Toggle between simple and complete dashboard
const USE_COMPLETE_DASHBOARD = true

export default function NeumorphismDashboard() {
  // Use complete dashboard if enabled
  if (USE_COMPLETE_DASHBOARD) {
    return <NeumorphismDashboardComplete />
  }

  // Simple dashboard implementation below
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Check authentication
  if (!isAuthenticated()) {
    return <Navigate to="/neumorphism" replace />
  }
  
  const session = getSession()
  const userEmail = session?.email || 'user@fastpay.com'
  const isAdmin = getUserAccess() === 0

  useEffect(() => {
    // Apply initial dark mode state
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const userMenuElement = document.querySelector('.neu-user-menu')
      
      if (userMenuElement && !userMenuElement.contains(target)) {
        setShowUserMenu(false)
      }
    }

    // Use a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    clearSession()
    navigate('/neumorphism')
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Apply dark mode to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'devices', label: 'Devices', icon: UserRound },
    { id: 'analytics', label: 'Analytics', icon: SlidersHorizontal },
    { id: 'gmail', label: 'Gmail', icon: Mail },
    { id: 'utilities', label: 'Utilities', icon: Wrench },
    { id: 'bank-cards', label: 'Bank Cards', icon: CreditCard },
  ]

  return (
    <div className={`neu-dashboard-container ${isDarkMode ? 'neu-dark' : ''}`}>
      <style>{`
        /* Neumorphic Dashboard Container */
        .neu-dashboard-container {
          min-height: 100vh;
          background: #e0e5ec;
          padding: 1.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: background 0.3s ease;
        }

        .neu-dashboard-container.neu-dark {
          background: #2d3748;
        }

        /* Top Navigation Bar */
        .neu-navbar {
          background: #e0e5ec;
          border-radius: 24px;
          padding: 1.25rem 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 
            12px 12px 24px rgba(163, 177, 198, 0.6),
            -12px -12px 24px rgba(255, 255, 255, 0.5);
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .neu-dark .neu-navbar {
          background: #2d3748;
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.4),
            -12px -12px 24px rgba(255, 255, 255, 0.05);
        }

        /* Logo Section */
        .neu-logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .neu-logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: #e0e5ec;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.6),
            -6px -6px 12px rgba(255, 255, 255, 0.5);
          color: #4a5568;
        }

        .neu-dark .neu-logo-icon {
          background: #2d3748;
          box-shadow: 
            6px 6px 12px rgba(0, 0, 0, 0.4),
            -6px -6px 12px rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }

        .neu-logo-text {
          display: flex;
          flex-direction: column;
        }

        .neu-logo-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #4a5568;
          line-height: 1.2;
        }

        .neu-dark .neu-logo-title {
          color: #e2e8f0;
        }

        .neu-logo-subtitle {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 500;
        }

        .neu-dark .neu-logo-subtitle {
          color: #cbd5e0;
        }

        /* Navigation Tabs */
        .neu-nav-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }

        .neu-nav-tab {
          padding: 0.625rem 1.25rem;
          border-radius: 12px;
          border: none;
          background: #e0e5ec;
          color: #4a5568;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.5);
          font-family: inherit;
        }

        .neu-dark .neu-nav-tab {
          background: #2d3748;
          color: #e2e8f0;
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neu-nav-tab:hover {
          box-shadow: 
            3px 3px 6px rgba(163, 177, 198, 0.6),
            -3px -3px 6px rgba(255, 255, 255, 0.5);
        }

        .neu-dark .neu-nav-tab:hover {
          box-shadow: 
            3px 3px 6px rgba(0, 0, 0, 0.4),
            -3px -3px 6px rgba(255, 255, 255, 0.05);
        }

        .neu-nav-tab.active {
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.6),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
          color: #667eea;
        }

        .neu-dark .neu-nav-tab.active {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05);
          color: #818cf8;
        }

        /* Controls Section */
        .neu-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        /* Theme Toggle */
        .neu-theme-toggle {
          width: 60px;
          height: 32px;
          border-radius: 16px;
          background: #e0e5ec;
          border: none;
          position: relative;
          cursor: pointer;
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.6),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }

        .neu-dark .neu-theme-toggle {
          background: #2d3748;
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neu-theme-toggle::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e0e5ec;
          top: 4px;
          left: 4px;
          transition: all 0.3s ease;
          box-shadow: 
            2px 2px 4px rgba(163, 177, 198, 0.6),
            -2px -2px 4px rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neu-dark .neu-theme-toggle::after {
          background: #2d3748;
          box-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.4),
            -2px -2px 4px rgba(255, 255, 255, 0.05);
        }

        .neu-theme-toggle.dark::after {
          left: 32px;
        }

        .neu-theme-toggle-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .neu-theme-toggle-icon.sun {
          left: 8px;
          color: #fbbf24;
        }

        .neu-theme-toggle-icon.moon {
          right: 8px;
          color: #93c5fd;
        }

        /* User Menu */
        .neu-user-menu {
          position: relative;
        }

        .neu-user-button {
          padding: 0.75rem 1.25rem;
          border-radius: 16px;
          border: none;
          background: #e0e5ec;
          color: #4a5568;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.6),
            -6px -6px 12px rgba(255, 255, 255, 0.5);
          font-family: inherit;
          white-space: nowrap;
        }

        .neu-dark .neu-user-button {
          background: #2d3748;
          color: #e2e8f0;
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neu-user-button:hover {
          box-shadow: 
            3px 3px 6px rgba(163, 177, 198, 0.6),
            -3px -3px 6px rgba(255, 255, 255, 0.5);
        }

        .neu-dark .neu-user-button:hover {
          box-shadow: 
            3px 3px 6px rgba(0, 0, 0, 0.4),
            -3px -3px 6px rgba(255, 255, 255, 0.05);
        }

        .neu-user-button:active {
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.6),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
        }

        .neu-dark .neu-user-button:active {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neu-user-button.active {
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.6),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
        }

        .neu-dark .neu-user-button.active {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neu-user-menu-dropdown {
          position: absolute;
          top: calc(100% + 0.75rem);
          right: 0;
          background: #e0e5ec;
          border-radius: 16px;
          padding: 0.5rem;
          min-width: 220px;
          box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.6),
            -8px -8px 16px rgba(255, 255, 255, 0.5);
          z-index: 1000;
          border: none;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .neu-dark .neu-user-menu-dropdown {
          background: #2d3748;
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.05);
        }

        .neu-menu-item {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #4a5568;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }

        .neu-dark .neu-menu-item {
          color: #e2e8f0;
        }

        .neu-menu-item:hover {
          background: rgba(163, 177, 198, 0.2);
          box-shadow: 
            inset 2px 2px 4px rgba(163, 177, 198, 0.3),
            inset -2px -2px 4px rgba(255, 255, 255, 0.3);
        }

        .neu-dark .neu-menu-item:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .neu-menu-item.logout {
          color: #e53e3e;
        }

        .neu-dark .neu-menu-item.logout {
          color: #fc8181;
        }

        /* Mobile Menu Toggle */
        .neu-mobile-menu-toggle {
          display: none;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: #e0e5ec;
          color: #4a5568;
          cursor: pointer;
          box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.5);
          align-items: center;
          justify-content: center;
        }

        .neu-dark .neu-mobile-menu-toggle {
          background: #2d3748;
          color: #e2e8f0;
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        /* Content Area */
        .neu-content {
          background: #e0e5ec;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 
            12px 12px 24px rgba(163, 177, 198, 0.6),
            -12px -12px 24px rgba(255, 255, 255, 0.5);
          min-height: 400px;
        }

        .neu-dark .neu-content {
          background: #2d3748;
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.4),
            -12px -12px 24px rgba(255, 255, 255, 0.05);
        }

        .neu-content-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 1rem;
        }

        .neu-dark .neu-content-title {
          color: #e2e8f0;
        }

        .neu-content-text {
          color: #718096;
          line-height: 1.6;
        }

        .neu-dark .neu-content-text {
          color: #cbd5e0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .neu-navbar {
            padding: 1rem;
          }

          .neu-nav-tabs {
            display: none;
          }

          .neu-mobile-menu-toggle {
            display: flex;
          }

          .neu-logo-section {
            flex: 1;
          }
        }
      `}</style>

      {/* Top Navigation Bar */}
      <nav className="neu-navbar">
        {/* Logo Section */}
        <div className="neu-logo-section">
          <div className="neu-logo-icon">
            <MessageSquare size={24} />
          </div>
          <div className="neu-logo-text">
            <div className="neu-logo-title">FASTPAY</div>
            <div className="neu-logo-subtitle">Dashboard</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {isAdmin && (
          <div className="neu-nav-tabs">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`neu-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Controls Section */}
        <div className="neu-controls">
          {/* Theme Toggle */}
          <button
            className={`neu-theme-toggle ${isDarkMode ? 'dark' : ''}`}
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            <Sun className="neu-theme-toggle-icon sun" size={16} />
            <Moon className="neu-theme-toggle-icon moon" size={16} />
          </button>

          {/* User Menu */}
          <div className="neu-user-menu">
            <button 
              className={`neu-user-button ${showUserMenu ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
              type="button"
            >
              <User size={18} />
              <span className="hidden sm:inline">{userEmail}</span>
              {isAdmin && <span className="hidden sm:inline text-xs opacity-70">(Admin)</span>}
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>
            {showUserMenu && (
              <div 
                className="neu-user-menu-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="neu-menu-item"
                  onClick={() => {
                    setShowUserMenu(false)
                    // Handle profile action
                  }}
                  type="button"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button 
                  className="neu-menu-item"
                  onClick={() => {
                    setShowUserMenu(false)
                    // Handle settings action
                  }}
                  type="button"
                >
                  <span>Settings</span>
                </button>
                <button 
                  className="neu-menu-item logout" 
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
                  }}
                  type="button"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="neu-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="neu-content">
        <h2 className="neu-content-title">
          {navigationTabs.find(t => t.id === activeTab)?.label || 'Overview'}
        </h2>
        <p className="neu-content-text">
          Welcome to the Neumorphic Dashboard. This is the {activeTab} section.
          <br />
          <br />
          The navigation bar above uses neumorphic design principles with soft shadows
          creating a tactile, modern interface. All interactive elements respond with
          smooth transitions and depth effects.
        </p>
      </div>
    </div>
  )
}
