import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: 'Active', value: 220, color: '#10B981' },
  { name: 'Maintenance', value: 15, color: '#F59E0B' },
  { name: 'Inactive', value: 12, color: '#EF4444' },
];

export function StatusChart() {
  return (
    <Card className="shadow">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-medium text-slate-900">สถานะ API</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
