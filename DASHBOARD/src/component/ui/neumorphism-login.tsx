import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoveRight, Loader, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { verifyLogin, getLoginRedirectPath } from '@/lib/auth'

export default function NeumorphismLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const trimmedEmail = email.trim()
      if (!trimmedEmail || !password) {
        setError('Email and password are required')
        return
      }

      const result = await verifyLogin(trimmedEmail, password)

      if (result.success && result.admin) {
        setEmail('')
        setPassword('')
        // Redirect based on user access level
        const redirectPath = getLoginRedirectPath(result.admin.access)
        navigate(redirectPath)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="neu-login-container">
      <style>{`
        /* Neumorphic Login Container */
        @import url('https://fonts.googleapis.com/css?family=Poppins&display=swap');
        html, body, #root {
          height: 100%;
        }

        body {
          margin: 0;
          overflow: hidden;
        }

        .neu-login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dddddd;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
          font-family: 'Poppins', 'Segoe UI', sans-serif;
        }

        /* Outer Login Card */
        .neu-login-card {
          background: #dddddd;
          border-radius: 14px;
          padding: 16px;
          width: 100%;
          max-width: 440px;
          box-shadow:
            0 0 3px 3px #dddddd,
            6px 6px 8px 4px rgba(136, 136, 136, 0.7),
            -6px -6px 8px 4px rgba(244, 244, 244, 0.7);
          border: none;
        }

        /* Inner Login Card */
        .neu-login-card-inner {
          background: #dddddd;
          border-radius: 12px;
          padding: 3.5rem 3rem 2.5rem;
          box-shadow:
            inset 6px 6px 12px rgba(136, 136, 136, 0.25),
            inset -6px -6px 12px rgba(255, 255, 255, 0.7);
        }

        /* Logo Section */
        .neu-logo-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .neu-logo-container {
          background: #dddddd;
          border-radius: 10px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1.75rem;
          box-shadow:
            0 0 3px 3px #dddddd,
            4px 4px 6px 2px rgba(136, 136, 136, 0.7),
            -4px -4px 6px 2px rgba(244, 244, 244, 0.7);
        }

        .neu-form-body {
          background: #dddddd;
          border-radius: 10px;
          padding: 2rem 1.75rem;
          box-shadow:
            inset 6px 6px 12px rgba(136, 136, 136, 0.2),
            inset -6px -6px 12px rgba(255, 255, 255, 0.7);
        }

        .neu-logo-title {
          font-size: 2.85rem;
          font-weight: 700;
          color: #333333;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .neu-logo-subtitle {
          font-size: 0.95rem;
          color: #666666;
          font-weight: 500;
        }

        /* Input Container */
        .neu-input-container {
          margin-bottom: 2rem;
          background: #dddddd;
          border-radius: 8px;
          padding: 0.4rem 0.6rem;
          box-shadow:
            inset 4px 4px 8px rgba(136, 136, 136, 0.2),
            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }

        .neu-input-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
          color: #333333;
        }

        .neu-input-icon {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          color: #666666;
          width: 20px;
          height: 20px;
          pointer-events: none;
        }

        .neu-input {
          width: 100%;
          height: 52px;
          border: none;
          outline: none;
          padding: 0 32px 0 28px;
          border-radius: 0;
          color: #4caf50;
          font-size: 15px;
          background-color: transparent;
          border-bottom: 2px solid #adadad;
          transition: all 0.4s;
          font-family: inherit;
          -webkit-text-fill-color: #4caf50;
        }

        .neu-input:focus {
          border-color: transparent;
          border-bottom: 2px solid #4caf50;
          color: #4caf50;
          -webkit-text-fill-color: #4caf50;
        }

        .neu-input:not(:placeholder-shown) {
          color: #4caf50;
          -webkit-text-fill-color: #4caf50;
          border-bottom: 2px solid #4caf50;
        }

        .neu-input::placeholder {
          color: #adadad;
        }

        .neu-input:-webkit-autofill,
        .neu-input:-webkit-autofill:hover,
        .neu-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #4caf50;
          -webkit-box-shadow: 0 0 0px 1000px #dddddd inset;
          box-shadow: 0 0 0px 1000px #dddddd inset;
        }

        .neu-floating-label {
          font-size: 15px;
          padding-left: 28px;
          position: absolute;
          top: 10px;
          transition: 0.3s;
          pointer-events: none;
          color: #666666;
        }

        .neu-input:not(:placeholder-shown) ~ .neu-floating-label,
        .neu-input:focus ~ .neu-floating-label {
          transition: 0.3s;
          padding-left: 28px;
          transform: translateY(-24px);
          font-size: 13px;
        }

        .neu-input:-webkit-autofill ~ .neu-floating-label,
        .neu-input:autofill ~ .neu-floating-label {
          padding-left: 28px;
          transform: translateY(-24px);
          font-size: 13px;
        }

        .neu-input-password-toggle {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #666666;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .neu-input-password-toggle:hover {
          color: #666666;
        }

        /* Button */
        .neu-button {
          width: 100%;
          height: 56px;
          background: transparent;
          border-radius: 25px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          color: #4caf50;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 3px 3px #dddddd,
            4px 4px 6px 2px rgba(136, 136, 136, 0.7),
            -4px -4px 6px 2px rgba(244, 244, 244, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neu-button:hover:not(:disabled) {
          background: #4caf50;
          color: #dddddd;
        }

        .neu-button:active:not(:disabled) {
          background: #ff9113;
          color: #dddddd;
        }

        .neu-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Error Message */
        .neu-error {
          background: #dddddd;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #e53e3e;
          font-size: 0.875rem;
          box-shadow: 
            inset 4px 4px 8px rgba(136, 136, 136, 0.2),
            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }

        /* Footer */
        .neu-footer {
          margin-top: 2.5rem;
          padding-top: 1.75rem;
          border-top: 1px solid #adadad;
          text-align: center;
        }

        .neu-footer-text {
          font-size: 0.75rem;
          color: #666666;
        }

        /* Loading Spinner */
        .neu-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Keep white theme regardless of system setting */
      `}</style>

      <div className="neu-login-card">
        <div className="neu-login-card-inner">
          <form onSubmit={handleSubmit}>
          {/* Logo Section */}
          <div className="neu-logo-container">
            <div className="neu-logo-section">
              <h1 className="neu-logo-title">FASTPAY</h1>
              <p className="neu-logo-subtitle">Secure Payment Management</p>
            </div>
          </div>

          <div className="neu-form-body">
            {/* Error Message */}
            {error && (
              <div className="neu-error">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="neu-input-container">
              <div className="neu-input-wrapper">
                <Mail className="neu-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="neu-input"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="email" className="neu-floating-label">
                  Email Address
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div className="neu-input-container">
              <div className="neu-input-wrapper">
                <Lock className="neu-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="neu-input"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="password" className="neu-floating-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="neu-input-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="neu-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="neu-spinner" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <MoveRight size={20} />
                </>
              )}
            </button>

            {/* Footer */}
            <div className="neu-footer">
              <p className="neu-footer-text">© 2024 FASTPAY. All rights reserved.</p>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
