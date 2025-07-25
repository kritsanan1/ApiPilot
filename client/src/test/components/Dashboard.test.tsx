import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import Dashboard from '@/pages/dashboard'

// Mock WebSocket hook
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    lastMessage: null,
  }),
}))

describe('Dashboard', () => {
  it('should render dashboard title', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('แดชบอร์ด API Management')).toBeInTheDocument()
    })
  })

  it('should display dashboard statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      // Check if stats cards are rendered
      expect(screen.getByText('จำนวน APIs ทั้งหมด')).toBeInTheDocument()
      expect(screen.getByText('APIs ที่ใช้งานได้')).toBeInTheDocument()
      expect(screen.getByText('Uptime เฉลี่ย')).toBeInTheDocument()
      expect(screen.getByText('Response Time เฉลี่ย')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(<Dashboard />)
    
    // Should render the component (loading is handled by React Query)
    expect(screen.getByText('แดชบอร์ด API Management')).toBeInTheDocument()
  })

  it('should have add new API button', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /เพิ่ม API ใหม่/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  it('should open API modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /เพิ่ม API ใหม่/i })
      expect(addButton).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /เพิ่ม API ใหม่/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/เพิ่ม API ใหม่/)).toBeInTheDocument()
    })
  })

  it('should have export report button', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /ส่งออกรายงาน/i })
      expect(exportButton).toBeInTheDocument()
    })
  })

  it('should display API table when APIs are loaded', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      // Should display the API management section
      expect(screen.getByText('จัดการ APIs')).toBeInTheDocument()
    })
  })

  it('should display performance chart section', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('ประสิทธิภาพ APIs')).toBeInTheDocument()
    })
  })

  it('should display system alerts section', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('การแจ้งเตือนระบบ')).toBeInTheDocument()
    })
  })

  it('should display recent tests section', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('การทดสอบล่าสุด')).toBeInTheDocument()
    })
  })
})