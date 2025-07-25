import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const alerts = [
  {
    type: 'warning',
    title: 'Response time spike detected',
    description: 'Payment Gateway API มี response time สูงกว่าปกติ',
    timestamp: '15 นาทีที่แล้ว',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
  {
    type: 'success',
    title: 'System maintenance completed',
    description: 'การปรับปรุงระบบเสร็จสิ้นแล้ว',
    timestamp: '2 ชั่วโมงที่แล้ว',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  {
    type: 'info',
    title: 'New API endpoint added',
    description: 'เพิ่ม endpoint ใหม่สำหรับ User Profile API',
    timestamp: '5 ชั่วโมงที่แล้ว',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  {
    type: 'error',
    title: 'API endpoint unavailable',
    description: 'Legacy API v1.0 ไม่สามารถเข้าถึงได้',
    timestamp: '1 วันที่แล้ว',
    icon: XCircle,
    iconColor: 'text-red-400',
  },
];

export function SystemAlerts() {
  return (
    <Card className="shadow">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-slate-900">การแจ้งเตือนระบบ</CardTitle>
          <Button variant="link" className="text-sm text-blue-600 hover:text-blue-500">
            ดูทั้งหมด
          </Button>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-slate-200">
        {alerts.map((alert, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <alert.icon className={`h-5 w-5 ${alert.iconColor}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.description}</p>
                <p className="text-xs text-slate-400 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
