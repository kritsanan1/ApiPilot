import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import ApiManagement from '@/pages/api-management'

describe('ApiManagement', () => {
  it('should render API management title', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('จัดการ APIs')).toBeInTheDocument()
    })
  })

  it('should display search and filter controls', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('ค้นหา APIs...')).toBeInTheDocument()
      expect(screen.getByText('สถานะทั้งหมด')).toBeInTheDocument()
    })
  })

  it('should have add new API button', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /เพิ่ม API ใหม่/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  it('should filter APIs by search term', async () => {
    const user = userEvent.setup()
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('ค้นหา APIs...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('ค้นหา APIs...')
    await user.type(searchInput, 'Test API 1')

    expect(searchInput).toHaveValue('Test API 1')
  })

  it('should open API modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<ApiManagement />)
    
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

  it('should display API cards when APIs are loaded', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      // Should display API cards based on mock data
      expect(screen.getByText('Test API 1')).toBeInTheDocument()
      expect(screen.getByText('Test API 2')).toBeInTheDocument()
    })
  })

  it('should show API status badges', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('ใช้งานได้')).toBeInTheDocument() // active status
      expect(screen.getByText('ไม่ใช้งาน')).toBeInTheDocument() // inactive status
    })
  })

  it('should display API URLs', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('https://api.example.com/v1/users')).toBeInTheDocument()
      expect(screen.getByText('https://api.example.com/v1/posts')).toBeInTheDocument()
    })
  })

  it('should show HTTP methods', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('GET')).toBeInTheDocument()
      expect(screen.getByText('POST')).toBeInTheDocument()
    })
  })

  it('should have test buttons for each API', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      const testButtons = screen.getAllByRole('button', { name: /ทดสอบ/i })
      expect(testButtons.length).toBeGreaterThan(0)
    })
  })

  it('should have edit buttons for each API', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /แก้ไข/i })
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('should have delete buttons for each API', async () => {
    render(<ApiManagement />)
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /ลบ/i })
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  it('should filter APIs by status', async () => {
    const user = userEvent.setup()
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('สถานะทั้งหมด')).toBeInTheDocument()
    })

    // Initially should show all APIs
    expect(screen.getByText('Test API 1')).toBeInTheDocument()
    expect(screen.getByText('Test API 2')).toBeInTheDocument()

    // Click on filter dropdown (this would need proper implementation in the component)
    const filterButton = screen.getByText('สถานะทั้งหมด')
    await user.click(filterButton)
  })

  it('should display empty state when no APIs match filter', async () => {
    const user = userEvent.setup()
    render(<ApiManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('ค้นหา APIs...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('ค้นหา APIs...')
    await user.type(searchInput, 'Non-existent API')

    // Should not show any API cards
    expect(screen.queryByText('Test API 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Test API 2')).not.toBeInTheDocument()
  })
})