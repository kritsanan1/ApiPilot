import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API Management routes
  app.get('/api/apis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apis = await storage.getApis(userId);
      res.json(apis);
    } catch (error) {
      console.error("Error fetching APIs:", error);
      res.status(500).json({ message: "Failed to fetch APIs" });
    }
  });

  app.get('/api/apis/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiId = parseInt(req.params.id);
      const api = await storage.getApiById(apiId, userId);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.json(api);
    } catch (error) {
      console.error("Error fetching API:", error);
      res.status(500).json({ message: "Failed to fetch API" });
    }
  });

  app.post('/api/apis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiData = insertApiSchema.parse({ ...req.body, userId });
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

  app.put('/api/apis/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiId = parseInt(req.params.id);
      const apiData = insertApiSchema.partial().parse(req.body);
      
      const updatedApi = await storage.updateApi(apiId, apiData, userId);
      
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

  app.delete('/api/apis/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiId = parseInt(req.params.id);
      const deleted = await storage.deleteApi(apiId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting API:", error);
      res.status(500).json({ message: "Failed to delete API" });
    }
  });

  // API Testing route
  app.post('/api/apis/:id/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiId = parseInt(req.params.id);
      
      // Verify API belongs to user
      const api = await storage.getApiById(apiId, userId);
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }

      const testData = testApiSchema.parse({
        url: api.url,
        method: api.method,
        headers: api.headers || {},
        ...req.body
      });

      const startTime = Date.now();
      let success = false;
      let statusCode = 0;
      let errorMessage = null;
      let responseBody = null;

      try {
        const response = await fetch(testData.url, {
          method: testData.method,
          headers: testData.headers,
          body: testData.body,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        statusCode = response.status;
        success = response.ok;
        responseBody = await response.text();
        
        if (!success) {
          errorMessage = `HTTP ${statusCode}: ${response.statusText}`;
        }
      } catch (error: any) {
        errorMessage = error.message;
        success = false;
      }

      const responseTime = Date.now() - startTime;

      // Save test result
      const testResult = await storage.createTestResult({
        apiId,
        success,
        responseTime,
        statusCode: statusCode || null,
        errorMessage,
        responseBody,
      });

      // Broadcast test result via WebSocket
      broadcastToUser(userId, {
        type: 'apiTestResult',
        data: {
          apiId,
          testResult,
          api: api.name,
        }
      });

      res.json({
        success,
        responseTime,
        statusCode,
        errorMessage,
        responseBody,
        timestamp: testResult.testedAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test data", errors: error.errors });
      }
      console.error("Error testing API:", error);
      res.status(500).json({ message: "Failed to test API" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Test results route
  app.get('/api/apis/:id/test-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Verify API belongs to user
      const api = await storage.getApiById(apiId, userId);
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }

      const testResults = await storage.getTestResults(apiId, limit);
      res.json(testResults);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const userConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req: any) => {
    let userId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
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

  // Function to broadcast messages to specific user
  function broadcastToUser(userId: string, message: any) {
    const connections = userConnections.get(userId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // Store reference for other modules
  (httpServer as any).broadcastToUser = broadcastToUser;

  return httpServer;
}
