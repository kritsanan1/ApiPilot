import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Edit, MoreHorizontal, Server, ShoppingCart, CreditCard, Filter, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import type { Api } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApiTableProps {
  apis: Api[];
  onAddApi: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-blue-100 text-blue-800';
    case 'POST':
      return 'bg-green-100 text-green-800';
    case 'PUT':
      return 'bg-orange-100 text-orange-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getApiIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'product':
      return ShoppingCart;
    case 'payment':
      return CreditCard;
    default:
      return Server;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-3 h-3" />;
    case 'maintenance':
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return null;
  }
};

export function ApiTable({ apis, onAddApi }: ApiTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testApiMutation = useMutation({
    mutationFn: async (apiId: number) => {
      const response = await apiRequest("POST", `/api/apis/${apiId}/test`);
      return await response.json();
    },
    onSuccess: (data, apiId) => {
      toast({
        title: "API Test ສຳເລັດ",
        description: `Response time: ${data.responseTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apis'] });
    },
    onError: (error) => {
      toast({
        title: "API Test ล้มเหลว",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (apis.length === 0) {
    return (
      <Card className="shadow">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-900">APIs ที่ใช้งานบ่อย</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-1 h-3 w-3" />
                กรองตาม
              </Button>
              <Button size="sm" onClick={onAddApi}>
                <Plus className="mr-1 h-3 w-3" />
                เพิ่ม API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <Server className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">ไม่มี API</h3>
            <p className="mt-1 text-sm text-slate-500">เริ่มต้นด้วยการเพิ่ม API แรกของคุณ</p>
            <div className="mt-6">
              <Button onClick={onAddApi}>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่ม API ใหม่
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-slate-900">APIs ที่ใช้งานบ่อย</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-3 w-3" />
              กรองตาม
            </Button>
            <Button size="sm" onClick={onAddApi}>
              <Plus className="mr-1 h-3 w-3" />
              เพิ่ม API
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">API Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Response Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {apis.slice(0, 5).map((api) => {
              const IconComponent = getApiIcon(api.category);
              return (
                <tr key={api.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900">{api.name}</div>
                        <div className="text-sm text-slate-500">{api.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getMethodColor(api.method)}>
                      {api.method}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`inline-flex items-center ${getStatusColor(api.status)}`}>
                      {getStatusIcon(api.status)}
                      <span className="ml-1">
                        {api.status === 'active' ? 'Active' : 
                         api.status === 'maintenance' ? 'Maintenance' : 'Inactive'}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {api.version || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-900"
                        onClick={() => testApiMutation.mutate(api.id)}
                        disabled={testApiMutation.isPending || api.status === 'maintenance'}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-slate-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-slate-900"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
