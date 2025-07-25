import { Card, CardContent } from "@/components/ui/card";
import { Server, Activity, Clock, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types/api";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statsItems = [
    {
      title: "APIs ทั้งหมด",
      value: stats.totalApis.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Server,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Uptime เฉลี่ย",
      value: `${stats.averageUptime.toFixed(1)}%`,
      change: "+0.3%",
      changeType: "positive" as const,
      icon: Activity,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Response Time",
      value: `${stats.averageResponseTime}ms`,
      change: "+5ms",
      changeType: "negative" as const,
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "ข้อผิดพลาด",
      value: stats.totalErrors.toString(),
      change: "-18%",
      changeType: "positive" as const,
      icon: AlertTriangle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsItems.map((item) => (
        <Card key={item.title} className="overflow-hidden shadow">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${item.bgColor} rounded-md flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">{item.title}</dt>
                  <dd className="text-lg font-medium text-slate-900">{item.value}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50 px-5 py-3">
            <div className="text-sm">
              <span className={`font-medium ${
                item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.change}
              </span>
              <span className="text-slate-500"> จากเดือนที่แล้ว</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
