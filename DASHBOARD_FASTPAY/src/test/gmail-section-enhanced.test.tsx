import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { GmailSection } from '@/pages/dashboard/views/GmailSection'

// Mock URL parameters
const mockURLParams = new URLSearchParams()

vi.mock('@/lib/utils', () => ({
  getApiUrl: () => 'https://test-api.com/api'
}))

describe('GmailSection Enhanced', () => {
  const defaultProps = {
    deviceId: 'test-device-123',
    isAdmin: true
  }

  beforeEach(() => {
    vi.stubGlobal('location', {
      search: '',
      href: 'http://localhost:3000/dashboard/v2'
    })
    mockURLParams.delete('google')
    mockURLParams.delete('message')
  })

  it('shows connect Gmail button when not connected', () => {
    render(<GmailSection {...defaultProps} />)
    
    expect(screen.getByText('Connect Gmail Account')).toBeInTheDocument()
    expect(screen.getByText(/Connect your Gmail account/)).toBeInTheDocument()
  })

  it('shows loading state during OAuth initiation', async () => {
    render(<GmailSection {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Gmail Account')
    fireEvent.click(connectButton)
    
    expect(screen.getByText('Initiating Gmail authentication...')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-loading-spinner')).toBeInTheDocument()
  })

  it('handles successful OAuth callback', () => {
    // Mock successful callback
    vi.stubGlobal('location', {
      search: '?google=connected&message=Gmail%20connected%20successfully',
      href: 'http://localhost:3000/dashboard/v2?google=connected&message=Gmail%20connected%20successfully'
    })
    
    render(<GmailSection {...defaultProps} />)
    
    expect(screen.getByText('Gmail Connected')).toBeInTheDocument()
    expect(screen.getByText(/successfully connected/)).toBeInTheDocument()
  })

  it('handles OAuth error callback', () => {
    // Mock error callback
    vi.stubGlobal('location', {
      search: '?google=error&message=Authentication%20failed',
      href: 'http://localhost:3000/dashboard/v2?google=error&message=Authentication%20failed'
    })
    
    render(<GmailSection {...defaultProps} />)
    
    expect(screen.getByText('Connection Failed')).toBeInTheDocument()
    expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})
