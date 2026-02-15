import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ApiLogSection } from '@/pages/dashboard/components/ApiLogSection'

const mockApiLogs = [
  {
    id: 1,
    method: 'GET',
    path: '/api/devices/',
    status_code: 200,
    user_identifier: 'test@example.com',
    response_time_ms: 150,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    method: 'POST',
    path: '/api/messages/',
    status_code: 400,
    user_identifier: 'other@example.com',
    response_time_ms: 200,
    created_at: '2024-01-15T10:31:00Z'
  }
]

describe('ApiLogSection Enhanced', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockApiLogs })
    }))
  })

  it('renders API log table with 50 entries by default', async () => {
    render(<ApiLogSection />)
    
    await waitFor(() => {
      expect(screen.getByText('GET /api/devices/')).toBeInTheDocument()
      expect(screen.getByText('POST /api/messages/')).toBeInTheDocument()
    })
  })

  it('filters logs by user identifier', async () => {
    render(<ApiLogSection />)
    
    const userFilter = screen.getByRole('combobox', { name: /Filter by user/ })
    fireEvent.click(userFilter)
    
    const testUserOption = screen.getByText('test@example.com')
    fireEvent.click(testUserOption)
    
    await waitFor(() => {
      expect(screen.getByText('GET /api/devices/')).toBeInTheDocument()
      expect(screen.queryByText('POST /api/messages/')).not.toBeInTheDocument()
    })
  })

  it('changes entry limit display', async () => {
    render(<ApiLogSection />)
    
    const limitSelect = screen.getByRole('combobox', { name: /Show entries/ })
    fireEvent.click(limitSelect)
    
    const fiftyOption = screen.getByText('50 entries')
    fireEvent.click(fiftyOption)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    })
  })

  it('shows real-time updates indicator', async () => {
    render(<ApiLogSection />)
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated/)).toBeInTheDocument()
      expect(screen.getByTestId('real-time-indicator')).toBeInTheDocument()
    })
  })

  it('shows empty state for filtered user', async () => {
    render(<ApiLogSection />)
    
    const userFilter = screen.getByRole('combobox', { name: /Filter by user/ })
    fireEvent.click(userFilter)
    
    const nonExistentUser = screen.getByText('nonexistent@example.com')
    fireEvent.click(nonExistentUser)
    
    await waitFor(() => {
      expect(screen.getByText(/No API logs for user "nonexistent@example.com"/)).toBeInTheDocument()
    })
  })

  it('handles refresh functionality', async () => {
    render(<ApiLogSection />)
    
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)
    
    // Should call fetch again
    await waitFor(() => {
      expect(screen.getByText('GET /api/devices/')).toBeInTheDocument()
    })
  })
})
