import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// APIs table
export const apis = pgTable("apis", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  method: varchar("method", { length: 10 }).notNull().default("GET"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  version: varchar("version", { length: 50 }),
  description: text("description"),
  headers: jsonb("headers").default({}),
  category: varchar("category", { length: 100 }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Test Results table
export const apiTestResults = pgTable("api_test_results", {
  id: serial("id").primaryKey(),
  apiId: integer("api_id").notNull().references(() => apis.id),
  success: boolean("success").notNull(),
  responseTime: integer("response_time"), // in milliseconds
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  responseBody: text("response_body"),
  testedAt: timestamp("tested_at").defaultNow(),
});

// API Monitoring Stats table
export const apiStats = pgTable("api_stats", {
  id: serial("id").primaryKey(),
  apiId: integer("api_id").notNull().references(() => apis.id),
  date: timestamp("date").notNull(),
  totalRequests: integer("total_requests").default(0),
  successfulRequests: integer("successful_requests").default(0),
  averageResponseTime: decimal("average_response_time", { precision: 8, scale: 2 }),
  uptime: decimal("uptime", { precision: 5, scale: 2 }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apis: many(apis),
}));

export const apisRelations = relations(apis, ({ one, many }) => ({
  user: one(users, {
    fields: [apis.userId],
    references: [users.id],
  }),
  testResults: many(apiTestResults),
  stats: many(apiStats),
}));

export const apiTestResultsRelations = relations(apiTestResults, ({ one }) => ({
  api: one(apis, {
    fields: [apiTestResults.apiId],
    references: [apis.id],
  }),
}));

export const apiStatsRelations = relations(apiStats, ({ one }) => ({
  api: one(apis, {
    fields: [apiStats.apiId],
    references: [apis.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiSchema = createInsertSchema(apis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestResultSchema = createInsertSchema(apiTestResults).omit({
  id: true,
  testedAt: true,
});

export const insertApiStatsSchema = createInsertSchema(apiStats).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertApi = z.infer<typeof insertApiSchema>;
export type Api = typeof apis.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type ApiTestResult = typeof apiTestResults.$inferSelect;
export type InsertApiStats = z.infer<typeof insertApiStatsSchema>;
export type ApiStats = typeof apiStats.$inferSelect;
