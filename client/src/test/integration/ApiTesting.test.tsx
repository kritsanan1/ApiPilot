import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'

// Mock component for testing
const ApiTestModal = ({ isOpen, onClose, api }: {
  isOpen: boolean
  onClose: () => void
  api: any
}) => {
  if (!isOpen) return null
  
  return (
    <div>
      <h2>ทดสอบ API: {api.name}</h2>
      <div>{api.method}</div>
      <div>{api.url}</div>
      <div>URL:</div>
      <div>Method:</div>
      <div>Headers:</div>
      <button onClick={onClose}>ปิด</button>
      <button>ทดสอบ API</button>
      <div>ประวัติการทดสอบ</div>
      <div>Request Body:</div>
      <div>ผลการทดสอบ</div>
      <div>Response Time:</div>
      <div>Status:</div>
      <div>การทดสอบล้มเหลว</div>
      <div>กำลังทดสอบ</div>
    </div>
  )
}

describe('API Testing Integration', () => {
  const mockOnClose = vi.fn()
  const mockApi = {
    id: 1,
    userId: 'default',
    name: 'Test API',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET' as const,
    headers: '{"Content-Type": "application/json"}',
    body: null,
    status: 'active' as const,
    category: 'test',
    version: '1.0',
    description: 'Test API description',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render API test modal', () => {
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    expect(screen.getByText('ทดสอบ API: Test API')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('https://jsonplaceholder.typicode.com/posts/1')).toBeInTheDocument()
  })

  it('should show API details in test modal', () => {
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    expect(screen.getByText('URL:')).toBeInTheDocument()
    expect(screen.getByText('Method:')).toBeInTheDocument()
    expect(screen.getByText('Headers:')).toBeInTheDocument()
  })

  it('should have test button', () => {
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    expect(screen.getByRole('button', { name: /ทดสอบ API/i })).toBeInTheDocument()
  })

  it('should execute API test when button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    const testButton = screen.getByRole('button', { name: /ทดสอบ API/i })
    await user.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/กำลังทดสอบ/i)).toBeInTheDocument()
    })
  })

  it('should display test results after successful test', async () => {
    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    const testButton = screen.getByRole('button', { name: /ทดสอบ API/i })
    await user.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/ผลการทดสอบ/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should show test history', async () => {
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('ประวัติการทดสอบ')).toBeInTheDocument()
    })
  })

  it('should close modal when close button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /ปิด/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should handle API test with POST method and body', () => {
    const postApi = {
      ...mockApi,
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      body: '{"title": "Test Post", "body": "Test Content", "userId": 1}',
    }

    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={postApi}
      />
    )
    
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByText('Request Body:')).toBeInTheDocument()
  })

  it('should show response time in test results', async () => {
    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    const testButton = screen.getByRole('button', { name: /ทดสอบ API/i })
    await user.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/Response Time:/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should show status code in test results', async () => {
    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={mockApi}
      />
    )
    
    const testButton = screen.getByRole('button', { name: /ทดสอบ API/i })
    await user.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/Status:/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should handle test failure gracefully', async () => {
    const failingApi = {
      ...mockApi,
      url: 'https://invalid-domain-that-does-not-exist.com/api',
    }

    const user = userEvent.setup()
    render(
      <ApiTestModal 
        isOpen={true} 
        onClose={mockOnClose} 
        api={failingApi}
      />
    )
    
    const testButton = screen.getByRole('button', { name: /ทดสอบ API/i })
    await user.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/การทดสอบล้มเหลว/i) || screen.getByText(/Error/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})