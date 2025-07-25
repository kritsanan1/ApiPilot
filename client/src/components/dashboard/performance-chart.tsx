import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: 'จันทร์', responseTime: 120, uptime: 99.8 },
  { name: 'อังคาร', responseTime: 135, uptime: 99.5 },
  { name: 'พุธ', responseTime: 110, uptime: 99.9 },
  { name: 'พฤหัสบดี', responseTime: 125, uptime: 99.7 },
  { name: 'ศุกร์', responseTime: 142, uptime: 99.2 },
  { name: 'เสาร์', responseTime: 118, uptime: 99.6 },
  { name: 'อาทิตย์', responseTime: 130, uptime: 99.8 },
];

export function PerformanceChart() {
  return (
    <Card className="shadow">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-medium text-slate-900">
          ประสิทธิภาพ API (7 วันที่ผ่านมา)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[95, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="responseTime" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Response Time (ms)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="uptime" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Uptime (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
