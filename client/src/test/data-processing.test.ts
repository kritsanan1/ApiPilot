import { describe, it, expect } from 'vitest'

// Data processing functions for API Management
export const processApiData = (apis: any[]) => {
  return {
    total: apis.length,
    active: apis.filter(api => api.status === 'active').length,
    inactive: apis.filter(api => api.status === 'inactive').length,
    maintenance: apis.filter(api => api.status === 'maintenance').length,
    byCategory: apis.reduce((acc, api) => {
      acc[api.category] = (acc[api.category] || 0) + 1
      return acc
    }, {}),
    byMethod: apis.reduce((acc, api) => {
      acc[api.method] = (acc[api.method] || 0) + 1
      return acc
    }, {})
  }
}

export const filterApisBySearch = (apis: any[], searchTerm: string) => {
  if (!searchTerm) return apis
  
  const term = searchTerm.toLowerCase()
  return apis.filter(api => 
    api.name.toLowerCase().includes(term) ||
    api.url.toLowerCase().includes(term) ||
    api.description.toLowerCase().includes(term) ||
    api.category.toLowerCase().includes(term)
  )
}

export const sortApisByField = (apis: any[], field: string, direction: 'asc' | 'desc' = 'asc') => {
  return [...apis].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]
    
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}

export const generateApiTestReport = (testResults: any[]) => {
  const totalTests = testResults.length
  const successfulTests = testResults.filter(test => test.success).length
  const failedTests = totalTests - successfulTests
  
  const averageResponseTime = testResults.length > 0
    ? testResults.reduce((sum, test) => sum + test.responseTime, 0) / testResults.length
    : 0
    
  const statusCodes = testResults.reduce((acc, test) => {
    acc[test.statusCode] = (acc[test.statusCode] || 0) + 1
    return acc
  }, {})

  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
    averageResponseTime: Math.round(averageResponseTime),
    statusCodes
  }
}

describe('Data Processing Functions', () => {
  const mockApis = [
    {
      id: 1,
      name: 'User API',
      url: 'https://api.example.com/users',
      method: 'GET',
      status: 'active',
      category: 'user-management',
      description: 'API for user operations'
    },
    {
      id: 2,
      name: 'Post API',
      url: 'https://api.example.com/posts',
      method: 'POST',
      status: 'inactive',
      category: 'content',
      description: 'API for creating posts'
    },
    {
      id: 3,
      name: 'Auth API',
      url: 'https://api.example.com/auth',
      method: 'POST',
      status: 'active',
      category: 'authentication',
      description: 'Authentication API'
    },
    {
      id: 4,
      name: 'Product API',
      url: 'https://api.example.com/products',
      method: 'GET',
      status: 'maintenance',
      category: 'content',
      description: 'Product catalog API'
    }
  ]

  describe('processApiData', () => {
    it('should process API data correctly', () => {
      const result = processApiData(mockApis)
      
      expect(result.total).toBe(4)
      expect(result.active).toBe(2)
      expect(result.inactive).toBe(1)
      expect(result.maintenance).toBe(1)
    })

    it('should group APIs by category', () => {
      const result = processApiData(mockApis)
      
      expect(result.byCategory).toEqual({
        'user-management': 1,
        'content': 2,
        'authentication': 1
      })
    })

    it('should group APIs by HTTP method', () => {
      const result = processApiData(mockApis)
      
      expect(result.byMethod).toEqual({
        'GET': 2,
        'POST': 2
      })
    })

    it('should handle empty API list', () => {
      const result = processApiData([])
      
      expect(result.total).toBe(0)
      expect(result.active).toBe(0)
      expect(result.byCategory).toEqual({})
      expect(result.byMethod).toEqual({})
    })
  })

  describe('filterApisBySearch', () => {
    it('should filter APIs by name', () => {
      const result = filterApisBySearch(mockApis, 'User')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('User API')
    })

    it('should filter APIs by URL', () => {
      const result = filterApisBySearch(mockApis, 'posts')
      expect(result).toHaveLength(1)
      expect(result[0].url).toContain('posts')
    })

    it('should filter APIs by description', () => {
      const result = filterApisBySearch(mockApis, 'authentication')
      expect(result).toHaveLength(1)
      expect(result[0].description).toContain('Authentication')
    })

    it('should filter APIs by category', () => {
      const result = filterApisBySearch(mockApis, 'content')
      expect(result).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      const result = filterApisBySearch(mockApis, 'USER')
      expect(result).toHaveLength(1)
    })

    it('should return all APIs when search term is empty', () => {
      const result = filterApisBySearch(mockApis, '')
      expect(result).toHaveLength(4)
    })
  })

  describe('sortApisByField', () => {
    it('should sort APIs by name ascending', () => {
      const result = sortApisByField(mockApis, 'name', 'asc')
      expect(result[0].name).toBe('Auth API')
      expect(result[1].name).toBe('Post API')
      expect(result[2].name).toBe('Product API')
      expect(result[3].name).toBe('User API')
    })

    it('should sort APIs by name descending', () => {
      const result = sortApisByField(mockApis, 'name', 'desc')
      expect(result[0].name).toBe('User API')
      expect(result[3].name).toBe('Auth API')
    })

    it('should sort APIs by ID', () => {
      const result = sortApisByField(mockApis, 'id', 'asc')
      expect(result[0].id).toBe(1)
      expect(result[3].id).toBe(4)
    })
  })

  describe('generateApiTestReport', () => {
    const mockTestResults = [
      { success: true, responseTime: 100, statusCode: 200 },
      { success: true, responseTime: 150, statusCode: 200 },
      { success: false, responseTime: 2000, statusCode: 500 },
      { success: true, responseTime: 120, statusCode: 201 }
    ]

    it('should generate correct test report', () => {
      const report = generateApiTestReport(mockTestResults)
      
      expect(report.totalTests).toBe(4)
      expect(report.successfulTests).toBe(3)
      expect(report.failedTests).toBe(1)
      expect(report.successRate).toBe(75)
      expect(report.averageResponseTime).toBe(593) // (100+150+2000+120)/4 = 2370/4 = 592.5 rounded to 593
    })

    it('should group status codes correctly', () => {
      const report = generateApiTestReport(mockTestResults)
      
      expect(report.statusCodes).toEqual({
        200: 2,
        201: 1,
        500: 1
      })
    })

    it('should handle empty test results', () => {
      const report = generateApiTestReport([])
      
      expect(report.totalTests).toBe(0)
      expect(report.successfulTests).toBe(0)
      expect(report.successRate).toBe(0)
      expect(report.averageResponseTime).toBe(0)
      expect(report.statusCodes).toEqual({})
    })

    it('should handle all successful tests', () => {
      const successTests = [
        { success: true, responseTime: 100, statusCode: 200 },
        { success: true, responseTime: 150, statusCode: 200 }
      ]
      
      const report = generateApiTestReport(successTests)
      expect(report.successRate).toBe(100)
    })
  })
})