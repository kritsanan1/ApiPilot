import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'
import { storage } from '../storage'

describe('API Routes', () => {
  let app: express.Application
  let server: any

  beforeEach(async () => {
    app = express()
    app.use(express.json())
    server = await registerRoutes(app)
  })

  afterEach(() => {
    if (server) {
      server.close()
    }
  })

  describe('GET /api/apis', () => {
    it('should return all APIs', async () => {
      const response = await request(app)
        .get('/api/apis')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/apis', () => {
    it('should create a new API', async () => {
      const newApi = {
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

      const response = await request(app)
        .post('/api/apis')
        .send(newApi)
        .expect(201)

      expect(response.body).toMatchObject({
        name: newApi.name,
        url: newApi.url,
        method: newApi.method,
        status: newApi.status
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.userId).toBe('default')
    })

    it('should return 400 for invalid API data', async () => {
      const invalidApi = {
        name: '', // Invalid: empty name
        url: 'invalid-url', // Invalid: not a proper URL
        method: 'INVALID' // Invalid: not a valid HTTP method
      }

      await request(app)
        .post('/api/apis')
        .send(invalidApi)
        .expect(400)
    })
  })

  describe('GET /api/apis/:id', () => {
    it('should return specific API by ID', async () => {
      // First create an API
      const newApi = {
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

      const createResponse = await request(app)
        .post('/api/apis')
        .send(newApi)
        .expect(201)

      const apiId = createResponse.body.id

      // Then fetch it
      const response = await request(app)
        .get(`/api/apis/${apiId}`)
        .expect(200)

      expect(response.body.id).toBe(apiId)
      expect(response.body.name).toBe(newApi.name)
    })

    it('should return 404 for non-existent API', async () => {
      await request(app)
        .get('/api/apis/99999')
        .expect(404)
    })
  })

  describe('PUT /api/apis/:id', () => {
    it('should update an existing API', async () => {
      // First create an API
      const newApi = {
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

      const createResponse = await request(app)
        .post('/api/apis')
        .send(newApi)
        .expect(201)

      const apiId = createResponse.body.id

      // Then update it
      const updates = {
        name: 'Updated API Name',
        status: 'inactive'
      }

      const response = await request(app)
        .put(`/api/apis/${apiId}`)
        .send(updates)
        .expect(200)

      expect(response.body.name).toBe(updates.name)
      expect(response.body.status).toBe(updates.status)
      expect(response.body.url).toBe(newApi.url) // Should preserve other fields
    })

    it('should return 404 for non-existent API', async () => {
      await request(app)
        .put('/api/apis/99999')
        .send({ name: 'Updated' })
        .expect(404)
    })
  })

  describe('DELETE /api/apis/:id', () => {
    it('should delete an existing API', async () => {
      // First create an API
      const newApi = {
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

      const createResponse = await request(app)
        .post('/api/apis')
        .send(newApi)
        .expect(201)

      const apiId = createResponse.body.id

      // Then delete it
      await request(app)
        .delete(`/api/apis/${apiId}`)
        .expect(204)

      // Verify it's gone
      await request(app)
        .get(`/api/apis/${apiId}`)
        .expect(404)
    })

    it('should return 404 for non-existent API', async () => {
      await request(app)
        .delete('/api/apis/99999')
        .expect(404)
    })
  })

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200)

      expect(response.body).toHaveProperty('totalApis')
      expect(response.body).toHaveProperty('activeApis')
      expect(response.body).toHaveProperty('averageUptime')
      expect(response.body).toHaveProperty('averageResponseTime')
      expect(response.body).toHaveProperty('totalErrors')

      expect(typeof response.body.totalApis).toBe('number')
      expect(typeof response.body.activeApis).toBe('number')
      expect(typeof response.body.averageUptime).toBe('number')
      expect(typeof response.body.averageResponseTime).toBe('number')
      expect(typeof response.body.totalErrors).toBe('number')
    })
  })

  describe('POST /api/test', () => {
    it('should test an API endpoint', async () => {
      const testData = {
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET'
      }

      const response = await request(app)
        .post('/api/test')
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('statusCode')
      expect(response.body).toHaveProperty('responseTime')
      expect(typeof response.body.responseTime).toBe('number')
    })

    it('should return 400 for invalid test data', async () => {
      const invalidTestData = {
        url: 'invalid-url',
        method: 'INVALID'
      }

      await request(app)
        .post('/api/test')
        .send(invalidTestData)
        .expect(400)
    })
  })

  describe('POST /api/apis/:id/test', () => {
    it('should test a specific API and store results', async () => {
      // First create an API
      const newApi = {
        name: 'Test API',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: null,
        status: 'active',
        category: 'test',
        version: '1.0',
        description: 'Test API description'
      }

      const createResponse = await request(app)
        .post('/api/apis')
        .send(newApi)
        .expect(201)

      const apiId = createResponse.body.id

      // Then test it
      const response = await request(app)
        .post(`/api/apis/${apiId}/test`)
        .expect(200)

      expect(response.body).toHaveProperty('apiId', apiId)
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('statusCode')
      expect(response.body).toHaveProperty('responseTime')
      expect(response.body).toHaveProperty('testedAt')
    })

    it('should return 404 for non-existent API', async () => {
      await request(app)
        .post('/api/apis/99999/test')
        .expect(404)
    })
  })
})