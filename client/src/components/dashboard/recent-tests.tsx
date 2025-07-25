import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Api, ApiTestResult } from "@/types/api";

interface RecentTestsProps {
  apis: Api[];
}

export function RecentTests({ apis }: RecentTestsProps) {
  // Get recent test results for all APIs
  const { data: recentTests = [] } = useQuery({
    queryKey: ['/api/dashboard/recent-tests'],
    enabled: apis.length > 0,
  });

  if (apis.length === 0) {
    return (
      <Card className="shadow">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-900">การทดสอบล่าสุด</CardTitle>
            <Button variant="link" className="text-sm text-blue-600 hover:text-blue-500">
              ดูทั้งหมด
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            ยังไม่มี API ที่ต้องทดสอบ
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock recent tests for display
  const mockRecentTests = [
    {
      apiName: apis[0]?.name || "API Test 1",
      timestamp: "2 นาทีที่แล้ว",
      success: true,
      responseTime: 125,
    },
    {
      apiName: apis[1]?.name || "API Test 2", 
      timestamp: "5 นาทีที่แล้ว",
      success: true,
      responseTime: 89,
    },
    {
      apiName: apis[2]?.name || "API Test 3",
      timestamp: "8 นาทีที่แล้ว", 
      success: false,
      responseTime: null,
    },
  ].filter((_, index) => index < apis.length);

  return (
    <Card className="shadow">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-slate-900">การทดสอบล่าสุด</CardTitle>
          <Button variant="link" className="text-sm text-blue-600 hover:text-blue-500">
            ดูทั้งหมด
          </Button>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-slate-200">
        {mockRecentTests.map((test, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                  test.success ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{test.apiName}</p>
                  <p className="text-xs text-slate-500">{test.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  test.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {test.success && test.responseTime ? `${test.responseTime}ms` : 'Timeout'}
                </span>
                {test.success ? (
                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
