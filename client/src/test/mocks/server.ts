import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { Api, DashboardStats } from '@/types/api'

const mockApis: Api[] = [
  {
    id: 1,
    userId: 'default',
    name: 'Test API 1',
    url: 'https://api.example.com/v1/users',
    method: 'GET',
    headers: '{"Content-Type": "application/json"}',
    body: null,
    status: 'active',
    category: 'user-management',
    version: '1.0',
    description: 'Test API for user management',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    userId: 'default',
    name: 'Test API 2',
    url: 'https://api.example.com/v1/posts',
    method: 'POST',
    headers: '{"Content-Type": "application/json"}',
    body: '{"title": "Test"}',
    status: 'inactive',
    category: 'content',
    version: '1.0',
    description: 'Test API for content management',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
]

const mockStats: DashboardStats = {
  totalApis: 2,
  activeApis: 1,
  averageUptime: 95.5,
  averageResponseTime: 150,
  totalErrors: 2,
}

export const handlers = [
  // API Management endpoints
  http.get('/api/apis', () => {
    return HttpResponse.json(mockApis)
  }),

  http.get('/api/apis/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const api = mockApis.find(api => api.id === id)
    
    if (!api) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(api)
  }),

  http.post('/api/apis', async ({ request }) => {
    const newApi = await request.json() as Omit<Api, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    const api: Api = {
      ...newApi,
      id: mockApis.length + 1,
      userId: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    mockApis.push(api)
    return HttpResponse.json(api, { status: 201 })
  }),

  http.put('/api/apis/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const updates = await request.json() as Partial<Api>
    const apiIndex = mockApis.findIndex(api => api.id === id)
    
    if (apiIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockApis[apiIndex] = {
      ...mockApis[apiIndex],
      ...updates,
      updatedAt: new Date(),
    }
    
    return HttpResponse.json(mockApis[apiIndex])
  }),

  http.delete('/api/apis/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const apiIndex = mockApis.findIndex(api => api.id === id)
    
    if (apiIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockApis.splice(apiIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Dashboard stats
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json(mockStats)
  }),

  // API Testing
  http.post('/api/test', async ({ request }) => {
    const testData = await request.json() as any
    
    return HttpResponse.json({
      success: true,
      statusCode: 200,
      responseTime: 150,
      errorMessage: null,
    })
  }),

  http.post('/api/apis/:id/test', ({ params }) => {
    const apiId = parseInt(params.id as string)
    
    return HttpResponse.json({
      id: Date.now(),
      apiId,
      success: true,
      statusCode: 200,
      responseTime: 150,
      errorMessage: null,
      testedAt: new Date(),
    })
  }),

  // Test results
  http.get('/api/apis/:id/test-results', ({ params }) => {
    const apiId = parseInt(params.id as string)
    
    return HttpResponse.json([
      {
        id: 1,
        apiId,
        success: true,
        statusCode: 200,
        responseTime: 150,
        errorMessage: null,
        testedAt: new Date(),
      },
      {
        id: 2,
        apiId,
        success: false,
        statusCode: 500,
        responseTime: 2000,
        errorMessage: 'Internal Server Error',
        testedAt: new Date(),
      },
    ])
  }),
]

export const server = setupServer(...handlers)