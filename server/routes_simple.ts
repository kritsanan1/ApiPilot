import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertApiSchema, insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

// Validation schemas
const testApiSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Management routes - simplified for single user
  app.get('/api/apis', async (req, res) => {
    try {
      const apis = await storage.getApis();
      res.json(apis);
    } catch (error) {
      console.error("Error fetching APIs:", error);
      res.status(500).json({ message: "Failed to fetch APIs" });
    }
  });

  app.get('/api/apis/:id', async (req, res) => {
    try {
      const apiId = parseInt(req.params.id);
      const api = await storage.getApiById(apiId);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.json(api);
    } catch (error) {
      console.error("Error fetching API:", error);
      res.status(500).json({ message: "Failed to fetch API" });
    }
  });

  app.post('/api/apis', async (req, res) => {
    try {
      const apiData = insertApiSchema.omit({ userId: true }).parse(req.body);
      const newApi = await storage.createApi(apiData);
      res.status(201).json(newApi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid API data", errors: error.errors });
      }
      console.error("Error creating API:", error);
      res.status(500).json({ message: "Failed to create API" });
    }
  });

  app.put('/api/apis/:id', async (req, res) => {
    try {
      const apiId = parseInt(req.params.id);
      const apiData = insertApiSchema.omit({ userId: true }).partial().parse(req.body);
      
      const updatedApi = await storage.updateApi(apiId, apiData);
      
      if (!updatedApi) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.json(updatedApi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid API data", errors: error.errors });
      }
      console.error("Error updating API:", error);
      res.status(500).json({ message: "Failed to update API" });
    }
  });

  app.delete('/api/apis/:id', async (req, res) => {
    try {
      const apiId = parseInt(req.params.id);
      const deleted = await storage.deleteApi(apiId);
      
      if (!deleted) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting API:", error);
      res.status(500).json({ message: "Failed to delete API" });
    }
  });

  // API Testing endpoint
  app.post('/api/test', async (req, res) => {
    try {
      const testData = testApiSchema.parse(req.body);
      
      const startTime = Date.now();
      let testResult;
      
      try {
        const response = await fetch(testData.url, {
          method: testData.method,
          headers: testData.headers,
          body: testData.method !== 'GET' ? testData.body : undefined,
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResult = {
          success: response.ok,
          statusCode: response.status,
          responseTime,
          errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
        };
        
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResult = {
          success: false,
          statusCode: 0,
          responseTime,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      
      res.json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test data", errors: error.errors });
      }
      console.error("Error testing API:", error);
      res.status(500).json({ message: "Failed to test API" });
    }
  });

  // API Testing with database storage
  app.post('/api/apis/:id/test', async (req, res) => {
    try {
      const apiId = parseInt(req.params.id);
      const api = await storage.getApiById(apiId);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }
      
      const startTime = Date.now();
      let testResult;
      
      try {
        const response = await fetch(api.url, {
          method: api.method,
          headers: api.headers ? JSON.parse(api.headers) : {},
          body: api.method !== 'GET' && api.body ? api.body : undefined,
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResult = {
          apiId,
          success: response.ok,
          statusCode: response.status,
          responseTime,
          errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
          testedAt: new Date(),
        };
        
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResult = {
          apiId,
          success: false,
          statusCode: 0,
          responseTime,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          testedAt: new Date(),
        };
      }
      
      // Store test result
      const savedResult = await storage.createTestResult(testResult);
      
      res.json(savedResult);
    } catch (error) {
      console.error("Error testing API:", error);
      res.status(500).json({ message: "Failed to test API" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Test results for an API
  app.get('/api/apis/:id/test-results', async (req, res) => {
    try {
      const apiId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const results = await storage.getTestResults(apiId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const userConnections = new Map<string, Set<any>>();

  wss.on('connection', (ws) => {
    let userId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'auth') {
          userId = 'default'; // Single user system
          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          const connections = userConnections.get(userId);
          if (connections) {
            connections.add(ws);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId)!.delete(ws);
        if (userConnections.get(userId)!.size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  });

  // Function to broadcast messages to all users
  function broadcastToAll(message: any) {
    userConnections.forEach((connections) => {
      connections.forEach((userWs: any) => {
        if (userWs.readyState === 1) { // WebSocket.OPEN
          userWs.send(JSON.stringify(message));
        }
      });
    });
  }

  // Store reference for other modules
  (httpServer as any).broadcastToAll = broadcastToAll;

  return httpServer;
}