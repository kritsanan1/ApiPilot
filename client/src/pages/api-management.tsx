import { useEffect, useState } from "react";
// Simplified for single user
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { ApiFormModal } from "@/components/api/api-form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Edit,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Api } from "@/types/api";
// Removed authentication utilities

export default function ApiManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiModal, setShowApiModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: apis = [], isLoading: apisLoading } = useQuery<Api[]>({
    queryKey: ['/api/apis'],
    retry: false,
  });

  const deleteApiMutation = useMutation({
    mutationFn: async (apiId: number) => {
      const response = await apiRequest("DELETE", `/api/apis/${apiId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "ลบ API สำเร็จ",
        description: "API ได้ถูกลบออกจากระบบแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testApiMutation = useMutation({
    mutationFn: async (apiId: number) => {
      const response = await apiRequest("POST", `/api/apis/${apiId}/test`);
      return await response.json();
    },
    onSuccess: (data, apiId) => {
      toast({
        title: "API Test สำเร็จ",
        description: `Response time: ${data.responseTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apis'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "API Test ล้มเหลว",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredApis = (apis as Api[]).filter((api: Api) => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || api.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleDeleteApi = (apiId: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบ API นี้?')) {
      deleteApiMutation.mutate(apiId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopHeader />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">จัดการ API</h1>
                    <p className="text-slate-600 mt-2">จัดการและติดตาม APIs ทั้งหมดของคุณ</p>
                  </div>
                  <Button onClick={() => setShowApiModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่ม API ใหม่
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="ค้นหา API..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">ทั้งหมด</option>
                      <option value="active">ใช้งาน</option>
                      <option value="inactive">ไม่ใช้งาน</option>
                      <option value="maintenance">ปรับปรุง</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* API List */}
              <div className="space-y-4">
                {apisLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">กำลังโหลด APIs...</p>
                  </div>
                ) : filteredApis.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-slate-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'ไม่พบ API ที่ตรงตามเงื่อนไข' 
                          : 'ยังไม่มี API ในระบบ'}
                      </div>
                      {!searchTerm && filterStatus === 'all' && (
                        <Button 
                          className="mt-4" 
                          onClick={() => setShowApiModal(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่ม API แรกของคุณ
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredApis.map(api => (
                    <Card key={api.id} className="bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900">{api.name}</h3>
                              <Badge className={getMethodColor(api.method)}>
                                {api.method}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(api.status)}
                                <Badge className={getStatusColor(api.status)}>
                                  {api.status === 'active' ? 'ใช้งาน' : 
                                   api.status === 'inactive' ? 'ไม่ใช้งาน' : 'ปรับปรุง'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-slate-600 mb-2">{api.description || 'ไม่มีคำอธิบาย'}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                <span>{api.url}</span>
                              </div>
                              {api.version && (
                                <span>v{api.version}</span>
                              )}
                              {api.category && (
                                <span>{api.category}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => testApiMutation.mutate(api.id)}
                              disabled={testApiMutation.isPending || api.status === 'maintenance'}
                              title="ทดสอบ API"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteApi(api.id)}
                              disabled={deleteApiMutation.isPending}
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
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
