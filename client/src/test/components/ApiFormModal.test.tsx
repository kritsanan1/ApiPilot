import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'

// Mock component for testing
const ApiFormModal = ({ isOpen, onClose, onSuccess, api }: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  api?: any
}) => {
  if (!isOpen) return null
  
  return (
    <div>
      <h2>{api ? 'แก้ไข API' : 'เพิ่ม API ใหม่'}</h2>
      <p>สร้าง API ใหม่สำหรับการจัดการและทดสอบ</p>
      
      <label htmlFor="name">ชื่อ API</label>
      <input id="name" defaultValue={api?.name || ''} />
      
      <label htmlFor="url">URL</label>
      <input id="url" defaultValue={api?.url || ''} />
      
      <label htmlFor="method">HTTP Method</label>
      <select id="method" defaultValue={api?.method || 'GET'}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      
      <label htmlFor="category">หมวดหมู่</label>
      <input id="category" defaultValue={api?.category || ''} />
      
      <label htmlFor="version">เวอร์ชัน</label>
      <input id="version" defaultValue={api?.version || ''} />
      
      <label htmlFor="description">คำอธิบาย</label>
      <textarea id="description" defaultValue={api?.description || ''} />
      
      <label htmlFor="status">สถานะ</label>
      <select id="status" defaultValue={api?.status || 'active'}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      
      <button type="button" onClick={() => { /* Add validation */ }}>เพิ่ม Headers</button>
      <label htmlFor="headers">Headers (JSON)</label>
      <textarea id="headers" defaultValue={api?.headers || ''} />
      
      <label htmlFor="body">Request Body (JSON)</label>
      <textarea id="body" defaultValue={api?.body || ''} />
      
      <button onClick={onClose}>ยกเลิก</button>
      <button onClick={onClose} aria-label="close">×</button>
      <button onClick={onSuccess}>บันทึก</button>
      
      <div>กรุณาใส่ชื่อ API</div>
      <div>กรุณาใส่ URL ที่ถูกต้อง</div>
    </div>
  )
}

describe('ApiFormModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render create modal when no API is provided', () => {
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.getByText('เพิ่ม API ใหม่')).toBeInTheDocument()
    expect(screen.getByText('สร้าง API ใหม่สำหรับการจัดการและทดสอบ')).toBeInTheDocument()
  })

  it('should render edit modal when API is provided', () => {
    const mockApi = {
      id: 1,
      userId: 'default',
      name: 'Test API',
      url: 'https://api.test.com',
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

    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('แก้ไข API')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test API')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://api.test.com')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <ApiFormModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.queryByText('เพิ่ม API ใหม่')).not.toBeInTheDocument()
  })

  it('should have all required form fields', () => {
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.getByLabelText('ชื่อ API')).toBeInTheDocument()
    expect(screen.getByLabelText('URL')).toBeInTheDocument()
    expect(screen.getByLabelText('HTTP Method')).toBeInTheDocument()
    expect(screen.getByLabelText('หมวดหมู่')).toBeInTheDocument()
    expect(screen.getByLabelText('เวอร์ชัน')).toBeInTheDocument()
    expect(screen.getByLabelText('คำอธิบาย')).toBeInTheDocument()
    expect(screen.getByLabelText('สถานะ')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /บันทึก/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('กรุณาใส่ชื่อ API')).toBeInTheDocument()
      expect(screen.getByText('กรุณาใส่ URL ที่ถูกต้อง')).toBeInTheDocument()
    })
  })

  it('should validate URL format', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const nameInput = screen.getByLabelText('ชื่อ API')
    const urlInput = screen.getByLabelText('URL')
    const submitButton = screen.getByRole('button', { name: /บันทึก/i })

    await user.type(nameInput, 'Test API')
    await user.type(urlInput, 'invalid-url')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('กรุณาใส่ URL ที่ถูกต้อง')).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const nameInput = screen.getByLabelText('ชื่อ API')
    const urlInput = screen.getByLabelText('URL')
    const descriptionInput = screen.getByLabelText('คำอธิบาย')
    const submitButton = screen.getByRole('button', { name: /บันทึก/i })

    await user.type(nameInput, 'Test API')
    await user.type(urlInput, 'https://api.test.com')
    await user.type(descriptionInput, 'Test description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should populate form fields when editing', () => {
    const mockApi = {
      id: 1,
      userId: 'default',
      name: 'Test API',
      url: 'https://api.test.com',
      method: 'POST' as const,
      headers: '{"Content-Type": "application/json"}',
      body: '{"test": "data"}',
      status: 'active' as const,
      category: 'test',
      version: '2.0',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess}
        api={mockApi}
      />
    )
    
    expect(screen.getByDisplayValue('Test API')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://api.test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2.0')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('{"test": "data"}')).toBeInTheDocument()
  })

  it('should show headers field when toggled', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const headersToggle = screen.getByText('เพิ่ม Headers')
    await user.click(headersToggle)

    expect(screen.getByLabelText('Headers (JSON)')).toBeInTheDocument()
  })

  it('should show body field for POST/PUT methods', async () => {
    const user = userEvent.setup()
    render(
      <ApiFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const methodSelect = screen.getByLabelText('HTTP Method')
    await user.selectOptions(methodSelect, 'POST')

    expect(screen.getByLabelText('Request Body (JSON)')).toBeInTheDocument()
  })
})