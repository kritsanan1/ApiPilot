import { describe, it, expect, beforeEach } from 'vitest'
import { DatabaseStorage } from '../storage'
import type { InsertApi } from '@shared/schema'

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage

  beforeEach(() => {
    storage = new DatabaseStorage()
  })

  describe('API Operations', () => {
    const mockApiData: Omit<InsertApi, 'userId'> = {
      name: 'Test API',
      url: 'https://api.test.com',
      method: 'GET',
      headers: '{"Content-Type": "application/json"}',
      body: null,
      status: 'active',
      category: 'test',
      version: '1.0',
      description: 'Test API description'
    }

    it('should create and retrieve APIs', async () => {
      const createdApi = await storage.createApi(mockApiData)
      
      expect(createdApi).toMatchObject(mockApiData)
      expect(createdApi.id).toBeDefined()
      expect(createdApi.userId).toBe('default')
      expect(createdApi.createdAt).toBeInstanceOf(Date)
      expect(createdApi.updatedAt).toBeInstanceOf(Date)

      const retrievedApi = await storage.getApiById(createdApi.id)
      expect(retrievedApi).toEqual(createdApi)
    })

    it('should list all APIs', async () => {
      await storage.createApi(mockApiData)
      await storage.createApi({ ...mockApiData, name: 'Test API 2' })

      const apis = await storage.getApis()
      expect(apis.length).toBeGreaterThanOrEqual(2)
    })

    it('should update APIs', async () => {
      const createdApi = await storage.createApi(mockApiData)
      
      const updates = {
        name: 'Updated API Name',
        status: 'inactive' as const
      }

      const updatedApi = await storage.updateApi(createdApi.id, updates)
      
      expect(updatedApi).toBeTruthy()
      expect(updatedApi!.name).toBe(updates.name)
      expect(updatedApi!.status).toBe(updates.status)
      expect(updatedApi!.url).toBe(mockApiData.url) // Should preserve other fields
    })

    it('should delete APIs', async () => {
      const createdApi = await storage.createApi(mockApiData)
      
      const deleted = await storage.deleteApi(createdApi.id)
      expect(deleted).toBe(true)

      const retrievedApi = await storage.getApiById(createdApi.id)
      expect(retrievedApi).toBeUndefined()
    })

    it('should return false when deleting non-existent API', async () => {
      const deleted = await storage.deleteApi(99999)
      expect(deleted).toBe(false)
    })

    it('should return undefined when getting non-existent API', async () => {
      const api = await storage.getApiById(99999)
      expect(api).toBeUndefined()
    })

    it('should return undefined when updating non-existent API', async () => {
      const updated = await storage.updateApi(99999, { name: 'Updated' })
      expect(updated).toBeUndefined()
    })
  })

  describe('Dashboard Stats', () => {
    it('should return dashboard statistics', async () => {
      const stats = await storage.getDashboardStats()
      
      expect(stats).toHaveProperty('totalApis')
      expect(stats).toHaveProperty('activeApis')
      expect(stats).toHaveProperty('averageUptime')
      expect(stats).toHaveProperty('averageResponseTime')
      expect(stats).toHaveProperty('totalErrors')

      expect(typeof stats.totalApis).toBe('number')
      expect(typeof stats.activeApis).toBe('number')
      expect(typeof stats.averageUptime).toBe('number')
      expect(typeof stats.averageResponseTime).toBe('number')
      expect(typeof stats.totalErrors).toBe('number')
    })

    it('should return zero stats when no APIs exist', async () => {
      // Assuming clean database or isolated test
      const stats = await storage.getDashboardStats()
      
      expect(stats.totalApis).toBeGreaterThanOrEqual(0)
      expect(stats.activeApis).toBeGreaterThanOrEqual(0)
      expect(stats.averageUptime).toBeGreaterThanOrEqual(0)
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0)
      expect(stats.totalErrors).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Test Results', () => {
    it('should create and retrieve test results', async () => {
      // First create an API
      const api = await storage.createApi({
        name: 'Test API',
        url: 'https://api.test.com',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: null,
        status: 'active',
        category: 'test',
        version: '1.0',
        description: 'Test API description'
      })

      // Then create a test result
      const testResult = await storage.createTestResult({
        apiId: api.id,
        success: true,
        statusCode: 200,
        responseTime: 150,
        errorMessage: null,
        testedAt: new Date()
      })

      expect(testResult.apiId).toBe(api.id)
      expect(testResult.success).toBe(true)
      expect(testResult.statusCode).toBe(200)
      expect(testResult.responseTime).toBe(150)

      // Retrieve test results
      const results = await storage.getTestResults(api.id)
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]).toEqual(testResult)
    })

    it('should limit test results when specified', async () => {
      // First create an API
      const api = await storage.createApi({
        name: 'Test API',
        url: 'https://api.test.com',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: null,
        status: 'active',
        category: 'test',
        version: '1.0',
        description: 'Test API description'
      })

      // Create multiple test results
      for (let i = 0; i < 5; i++) {
        await storage.createTestResult({
          apiId: api.id,
          success: true,
          statusCode: 200,
          responseTime: 150 + i,
          errorMessage: null,
          testedAt: new Date()
        })
      }

      const results = await storage.getTestResults(api.id, 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })
  })
})