import { describe, it, expect } from 'vitest'

// API utility functions to test
export const validateApiUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

export const validateHttpMethod = (method: string): boolean => {
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())
}

export const calculateUptime = (testResults: Array<{ success: boolean }>): number => {
  if (testResults.length === 0) return 0
  const successCount = testResults.filter(result => result.success).length
  return (successCount / testResults.length) * 100
}

export const calculateAverageResponseTime = (testResults: Array<{ responseTime: number }>): number => {
  if (testResults.length === 0) return 0
  const totalTime = testResults.reduce((sum, result) => sum + result.responseTime, 0)
  return totalTime / testResults.length
}

export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'active': return 'green'
    case 'inactive': return 'gray'
    case 'maintenance': return 'yellow'
    default: return 'gray'
  }
}

describe('API Utility Functions', () => {
  describe('validateApiUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateApiUrl('https://api.example.com')).toBe(true)
      expect(validateApiUrl('http://localhost:3000/api')).toBe(true)
      expect(validateApiUrl('https://api.github.com/users')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(validateApiUrl('not-a-url')).toBe(false)
      expect(validateApiUrl('ftp://example.com')).toBe(false)
      expect(validateApiUrl('')).toBe(false)
      expect(validateApiUrl('just-text')).toBe(false)
    })
  })

  describe('validateHttpMethod', () => {
    it('should validate standard HTTP methods', () => {
      expect(validateHttpMethod('GET')).toBe(true)
      expect(validateHttpMethod('POST')).toBe(true)
      expect(validateHttpMethod('PUT')).toBe(true)
      expect(validateHttpMethod('DELETE')).toBe(true)
      expect(validateHttpMethod('PATCH')).toBe(true)
    })

    it('should handle case insensitive methods', () => {
      expect(validateHttpMethod('get')).toBe(true)
      expect(validateHttpMethod('post')).toBe(true)
      expect(validateHttpMethod('Put')).toBe(true)
    })

    it('should reject invalid methods', () => {
      expect(validateHttpMethod('INVALID')).toBe(false)
      expect(validateHttpMethod('FETCH')).toBe(false)
      expect(validateHttpMethod('')).toBe(false)
    })
  })

  describe('calculateUptime', () => {
    it('should calculate uptime correctly', () => {
      const testResults = [
        { success: true },
        { success: true },
        { success: false },
        { success: true }
      ]
      expect(calculateUptime(testResults)).toBe(75) // 3/4 * 100
    })

    it('should handle empty results', () => {
      expect(calculateUptime([])).toBe(0)
    })

    it('should handle all successful results', () => {
      const testResults = [
        { success: true },
        { success: true },
        { success: true }
      ]
      expect(calculateUptime(testResults)).toBe(100)
    })

    it('should handle all failed results', () => {
      const testResults = [
        { success: false },
        { success: false }
      ]
      expect(calculateUptime(testResults)).toBe(0)
    })
  })

  describe('calculateAverageResponseTime', () => {
    it('should calculate average response time', () => {
      const testResults = [
        { responseTime: 100 },
        { responseTime: 200 },
        { responseTime: 300 }
      ]
      expect(calculateAverageResponseTime(testResults)).toBe(200)
    })

    it('should handle empty results', () => {
      expect(calculateAverageResponseTime([])).toBe(0)
    })

    it('should handle single result', () => {
      const testResults = [{ responseTime: 150 }]
      expect(calculateAverageResponseTime(testResults)).toBe(150)
    })
  })

  describe('formatResponseTime', () => {
    it('should format milliseconds correctly', () => {
      expect(formatResponseTime(500)).toBe('500ms')
      expect(formatResponseTime(999)).toBe('999ms')
    })

    it('should format seconds correctly', () => {
      expect(formatResponseTime(1000)).toBe('1.00s')
      expect(formatResponseTime(1500)).toBe('1.50s')
      expect(formatResponseTime(2750)).toBe('2.75s')
    })
  })

  describe('getStatusBadgeColor', () => {
    it('should return correct colors for each status', () => {
      expect(getStatusBadgeColor('active')).toBe('green')
      expect(getStatusBadgeColor('inactive')).toBe('gray')
      expect(getStatusBadgeColor('maintenance')).toBe('yellow')
    })

    it('should return default color for unknown status', () => {
      expect(getStatusBadgeColor('unknown')).toBe('gray')
      expect(getStatusBadgeColor('')).toBe('gray')
    })
  })
})