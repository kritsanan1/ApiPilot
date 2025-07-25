import {
  users,
  apis,
  apiTestResults,
  apiStats,
  type User,
  type UpsertUser,
  type Api,
  type InsertApi,
  type ApiTestResult,
  type InsertTestResult,
  type ApiStats,
  type InsertApiStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // API operations
  getApis(userId: string): Promise<Api[]>;
  getApiById(id: number, userId: string): Promise<Api | undefined>;
  createApi(api: InsertApi): Promise<Api>;
  updateApi(id: number, api: Partial<InsertApi>, userId: string): Promise<Api | undefined>;
  deleteApi(id: number, userId: string): Promise<boolean>;
  
  // Test result operations
  createTestResult(result: InsertTestResult): Promise<ApiTestResult>;
  getTestResults(apiId: number, limit?: number): Promise<ApiTestResult[]>;
  
  // Stats operations
  createApiStats(stats: InsertApiStats): Promise<ApiStats>;
  getApiStats(apiId: number, days?: number): Promise<ApiStats[]>;
  getDashboardStats(userId: string): Promise<{
    totalApis: number;
    activeApis: number;
    averageUptime: number;
    averageResponseTime: number;
    totalErrors: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // API operations
  async getApis(userId: string): Promise<Api[]> {
    return await db
      .select()
      .from(apis)
      .where(eq(apis.userId, userId))
      .orderBy(desc(apis.updatedAt));
  }

  async getApiById(id: number, userId: string): Promise<Api | undefined> {
    const [api] = await db
      .select()
      .from(apis)
      .where(and(eq(apis.id, id), eq(apis.userId, userId)));
    return api;
  }

  async createApi(api: InsertApi): Promise<Api> {
    const [newApi] = await db.insert(apis).values(api).returning();
    return newApi;
  }

  async updateApi(id: number, apiData: Partial<InsertApi>, userId: string): Promise<Api | undefined> {
    const [updatedApi] = await db
      .update(apis)
      .set({ ...apiData, updatedAt: new Date() })
      .where(and(eq(apis.id, id), eq(apis.userId, userId)))
      .returning();
    return updatedApi;
  }

  async deleteApi(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(apis)
      .where(and(eq(apis.id, id), eq(apis.userId, userId)));
    return result.rowCount > 0;
  }

  // Test result operations
  async createTestResult(result: InsertTestResult): Promise<ApiTestResult> {
    const [testResult] = await db.insert(apiTestResults).values(result).returning();
    return testResult;
  }

  async getTestResults(apiId: number, limit = 50): Promise<ApiTestResult[]> {
    return await db
      .select()
      .from(apiTestResults)
      .where(eq(apiTestResults.apiId, apiId))
      .orderBy(desc(apiTestResults.testedAt))
      .limit(limit);
  }

  // Stats operations
  async createApiStats(stats: InsertApiStats): Promise<ApiStats> {
    const [apiStats] = await db.insert(apiStats).values(stats).returning();
    return apiStats;
  }

  async getApiStats(apiId: number, days = 7): Promise<ApiStats[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(apiStats)
      .where(and(
        eq(apiStats.apiId, apiId),
        sql`${apiStats.date} >= ${startDate}`
      ))
      .orderBy(desc(apiStats.date));
  }

  async getDashboardStats(userId: string): Promise<{
    totalApis: number;
    activeApis: number;
    averageUptime: number;
    averageResponseTime: number;
    totalErrors: number;
  }> {
    // Get user APIs
    const userApis = await db
      .select()
      .from(apis)
      .where(eq(apis.userId, userId));

    const totalApis = userApis.length;
    const activeApis = userApis.filter(api => api.status === 'active').length;

    if (totalApis === 0) {
      return {
        totalApis: 0,
        activeApis: 0,
        averageUptime: 0,
        averageResponseTime: 0,
        totalErrors: 0,
      };
    }

    // Get recent test results for all user APIs
    const apiIds = userApis.map(api => api.id);
    const recentResults = await db
      .select()
      .from(apiTestResults)
      .where(sql`${apiTestResults.apiId} = ANY(${apiIds})`)
      .orderBy(desc(apiTestResults.testedAt))
      .limit(1000);

    const successfulTests = recentResults.filter(result => result.success);
    const averageUptime = recentResults.length > 0 ? (successfulTests.length / recentResults.length) * 100 : 0;
    
    const responseTimes = recentResults
      .filter(result => result.responseTime !== null)
      .map(result => result.responseTime!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const totalErrors = recentResults.filter(result => !result.success).length;

    return {
      totalApis,
      activeApis,
      averageUptime: Math.round(averageUptime * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      totalErrors,
    };
  }
}

export const storage = new DatabaseStorage();
