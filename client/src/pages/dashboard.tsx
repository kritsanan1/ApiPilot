import { useEffect } from "react";
// Simplified for single user
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RecentTests } from "@/components/dashboard/recent-tests";
import { SystemAlerts } from "@/components/dashboard/system-alerts";
import { ApiTable } from "@/components/dashboard/api-table";
import { ApiFormModal } from "@/components/api/api-form-modal";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Api, DashboardStats } from "@/types/api";
// Removed authentication utilities

export default function Dashboard() {
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();
  const [showApiModal, setShowApiModal] = useState(false);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'apiTestResult') {
        toast({
          title: `API Test Result: ${lastMessage.data.api}`,
          description: `Response time: ${lastMessage.data.testResult.responseTime}ms`,
        });
      }
    }
  }, [lastMessage, toast]);

  const { data: apis = [], isLoading: apisLoading } = useQuery<Api[]>({
    queryKey: ['/api/apis'],
    retry: false,
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const defaultStats: DashboardStats = {
    totalApis: 0,
    activeApis: 0,
    averageUptime: 0,
    averageResponseTime: 0,
    totalErrors: 0,
  };

  return (
    <div className="flex h-full">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopHeader />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page Header */}
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                    แดชบอร์ด API Management
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    ภาพรวมการทำงานของ APIs ทั้งหมดในระบบ
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Button variant="outline" className="mr-3">
                    <Download className="mr-2 h-4 w-4" />
                    ส่งออกรายงาน
                  </Button>
                  <Button onClick={() => setShowApiModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่ม API ใหม่
                  </Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <StatsGrid stats={stats || defaultStats} />

              {/* Main Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <PerformanceChart />
                <StatusChart />
              </div>

              {/* Recent API Tests and Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RecentTests apis={apis} />
                <SystemAlerts />
              </div>

              {/* API Management Quick Access */}
              <ApiTable apis={apis} onAddApi={() => setShowApiModal(true)} />
            </div>
          </div>
        </main>
      </div>

      <ApiFormModal 
        open={showApiModal} 
        onOpenChange={setShowApiModal}
      />
    </div>
  );
}
