export interface Api {
  id: number;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'maintenance';
  version?: string;
  description?: string;
  headers?: Record<string, string>;
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTestResult {
  id: number;
  apiId: number;
  success: boolean;
  responseTime: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  responseBody: string | null;
  testedAt: string;
}

export interface DashboardStats {
  totalApis: number;
  activeApis: number;
  averageUptime: number;
  averageResponseTime: number;
  totalErrors: number;
}

export interface CreateApiRequest {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'maintenance';
  version?: string;
  description?: string;
  headers?: Record<string, string>;
  category?: string;
}

export interface TestApiResponse {
  success: boolean;
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  responseBody: string | null;
  timestamp: string;
}
