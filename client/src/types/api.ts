export interface Api {
  id: number
  userId: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: string | null
  body: string | null
  status: 'active' | 'inactive' | 'maintenance'
  category: string
  version: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalApis: number
  activeApis: number
  averageUptime: number
  averageResponseTime: number
  totalErrors: number
}

export interface ApiTestResult {
  id: number
  apiId: number
  success: boolean
  statusCode: number
  responseTime: number
  errorMessage: string | null
  testedAt: Date
}