import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DeviceSectionTabs } from '@/pages/dashboard/components/DeviceSectionTabs'

describe('DeviceSectionTabs Enhanced', () => {
  const mockOnTabChange = vi.fn()
  const defaultProps = {
    activeTab: 'message' as const,
    onTabChange: mockOnTabChange,
    deviceId: 'test-device-123',
    isAdmin: true
  }

  beforeEach(() => {
    mockOnTabChange.mockClear()
  })

  it('renders all tabs including admin-only tabs when isAdmin is true', () => {
    render(<DeviceSectionTabs {...defaultProps} />)
    
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Command')).toBeInTheDocument()  // Admin-only
    expect(screen.getByText('Instruction')).toBeInTheDocument()
    expect(screen.getByText('Permission')).toBeInTheDocument()  // Admin-only
  })

  it('hides admin-only tabs when isAdmin is false', () => {
    render(<DeviceSectionTabs {...defaultProps} isAdmin={false} />)
    
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Instruction')).toBeInTheDocument()
    expect(screen.queryByText('Command')).not.toBeInTheDocument()  // Admin-only hidden
    expect(screen.queryByText('Permission')).not.toBeInTheDocument()  // Admin-only hidden
  })

  it('calls onTabChange when tab is clicked', () => {
    render(<DeviceSectionTabs {...defaultProps} />)
    
    const gmailTab = screen.getByText('Gmail')
    fireEvent.click(gmailTab)
    
    expect(mockOnTabChange).toHaveBeenCalledWith('google')
  })

  it('applies active styling to current tab', () => {
    render(<DeviceSectionTabs {...defaultProps} activeTab="google" />)
    
    const gmailTab = screen.getByText('Gmail')
    expect(gmailTab.closest('button')).toHaveClass('bg-primary')
  })

  it('returns null when deviceId is null', () => {
    const { container } = render(
      <DeviceSectionTabs {...defaultProps} deviceId={null} />
    )
    
    expect(container.firstChild).toBeNull()
  })
})
