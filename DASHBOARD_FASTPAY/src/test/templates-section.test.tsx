import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { TemplatesSection } from '@/pages/dashboard/components/TemplatesSection'

const mockTemplates = [
  {
    id: 1,
    template_code: 'AA.BB',
    template_name: 'Axis Bank Template',
    bank_name: 'Axis Bank',
    card_type: 'debit',
    is_active: true
  },
  {
    id: 2,
    template_code: 'CC.DD',
    template_name: 'City Bank Template',
    bank_name: 'City Bank',
    card_type: 'credit',
    is_active: true
  }
]

describe('TemplatesSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockTemplates })
    }))
  })

  it('renders template management tabs', () => {
    render(<TemplatesSection />)
    
    expect(screen.getByText('View Templates')).toBeInTheDocument()
    expect(screen.getByText('Create New')).toBeInTheDocument()
    expect(screen.getByText('Edit Template')).toBeInTheDocument()
  })

  it('shows template list in view tab', async () => {
    render(<TemplatesSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Axis Bank Template')).toBeInTheDocument()
      expect(screen.getByText('City Bank Template')).toBeInTheDocument()
    })
  })

  it('switches to create tab when Create New is clicked', () => {
    render(<TemplatesSection />)
    
    const createTab = screen.getByText('Create New')
    fireEvent.click(createTab)
    
    expect(screen.getByText('Template Name')).toBeInTheDocument()
    expect(screen.getByText('Bank Name')).toBeInTheDocument()
    expect(screen.getByText('Card Type')).toBeInTheDocument()
  })

  it('validates template fields before creation', async () => {
    render(<TemplatesSection />)
    
    const createTab = screen.getByText('Create New')
    fireEvent.click(createTab)
    
    const submitButton = screen.getByText('Create Template')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Template Code is required/)).toBeInTheDocument()
    })
  })

  it('shows empty state when no templates exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] })
    }))
    
    render(<TemplatesSection />)
    
    await waitFor(() => {
      expect(screen.getByText('No templates found')).toBeInTheDocument()
      expect(screen.getByText('Create First Template')).toBeInTheDocument()
    })
  })

  it('handles template duplication', async () => {
    render(<TemplatesSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Axis Bank Template')).toBeInTheDocument()
    })
    
    const duplicateButtons = screen.getAllByTestId('duplicate-template')
    fireEvent.click(duplicateButtons[0])
    
    // Should show success toast (mocked)
    expect(screen.getByText('Template duplicated successfully')).toBeInTheDocument()
  })
})
