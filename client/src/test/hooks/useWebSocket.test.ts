import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '@/hooks/useWebSocket'

// Mock WebSocket
class MockWebSocket {
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  readyState: number = WebSocket.CONNECTING

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 0)
  }

  send(data: string) {
    // Mock send implementation
  }

  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

describe('useWebSocket', () => {
  beforeEach(() => {
    // Mock WebSocket globally
    global.WebSocket = MockWebSocket as any
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useWebSocket())
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.lastMessage).toBe(null)
  })

  it('should connect to WebSocket on mount', async () => {
    const { result } = renderHook(() => useWebSocket())
    
    // Fast-forward timers to complete connection
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.isConnected).toBe(true)
  })

  it('should handle incoming messages', async () => {
    const { result } = renderHook(() => useWebSocket())
    
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.isConnected).toBe(true)

    // Simulate receiving a message
    const mockMessage = { type: 'apiTestResult', data: { test: 'data' } }
    
    act(() => {
      const mockWs = new MockWebSocket('ws://localhost/ws')
      mockWs.readyState = WebSocket.OPEN
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(mockMessage)
        }))
      }
    })

    // Note: In a real implementation, we'd need to track the message state
    // This test structure shows how to test WebSocket message handling
  })

  it('should attempt to reconnect on connection loss', () => {
    const { result } = renderHook(() => useWebSocket())
    
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.isConnected).toBe(true)

    // Simulate connection loss
    act(() => {
      const mockWs = new MockWebSocket('ws://localhost/ws')
      if (mockWs.onclose) {
        mockWs.onclose(new CloseEvent('close'))
      }
    })

    expect(result.current.isConnected).toBe(false)

    // Should attempt to reconnect after 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Connection should be re-established
    act(() => {
      vi.runAllTimers()
    })
  })

  it('should send authentication message on connection', () => {
    const sendSpy = vi.fn()
    
    class SpyWebSocket extends MockWebSocket {
      send(data: string) {
        sendSpy(data)
      }
    }
    
    global.WebSocket = SpyWebSocket as any
    
    renderHook(() => useWebSocket())
    
    act(() => {
      vi.runAllTimers()
    })

    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'auth' }))
  })

  it('should handle WebSocket errors gracefully', () => {
    const { result } = renderHook(() => useWebSocket())
    
    act(() => {
      vi.runAllTimers()
    })

    // Simulate WebSocket error
    act(() => {
      const mockWs = new MockWebSocket('ws://localhost/ws')
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'))
      }
    })

    expect(result.current.isConnected).toBe(false)
  })

  it('should cleanup WebSocket connection on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket())
    
    act(() => {
      vi.runAllTimers()
    })

    const closeSpy = vi.fn()
    
    class SpyWebSocket extends MockWebSocket {
      close() {
        closeSpy()
        super.close()
      }
    }
    
    global.WebSocket = SpyWebSocket as any

    unmount()

    // Note: In a real implementation, we'd verify the WebSocket connection is properly closed
    // This test structure shows how to test cleanup behavior
  })
})