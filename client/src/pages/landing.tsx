import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Server, Activity, FileText, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-slate-900">API Management</h1>
            </div>
            <Button onClick={() => window.location.href = "/api/login"}>
              เข้าสู่ระบบ
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            จัดการ API ของคุณ
            <span className="text-blue-600"> อย่างมืออาชีพ</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            ระบบจัดการ API ที่ครบครัน พร้อมการตรวจสอบแบบเรียลไทม์ การทดสอบ API และแดชบอร์ดการวิเคราะห์ที่ทรงพลัง
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            เริ่มต้นใช้งาน
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>จัดการ API</CardTitle>
              <CardDescription>
                เพิ่ม แก้ไข และจัดระเบียบ APIs ของคุณในที่เดียว
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>การตรวจสอบแบบเรียลไทม์</CardTitle>
              <CardDescription>
                ติดตามสถานะและประสิทธิภาพของ API แบบเรียลไทม์
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>การวิเคราะห์และรายงาน</CardTitle>
              <CardDescription>
                แดชบอร์ดการวิเคราะห์ที่ละเอียดพร้อมกราฟและสถิติ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>เอกสาร API</CardTitle>
              <CardDescription>
                สร้างและจัดการเอกสาร API อัตโนมัติ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>ความปลอดภัย</CardTitle>
              <CardDescription>
                ระบบรักษาความปลอดภัยขั้นสูงสำหรับ API ของคุณ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>ทดสอบ API</CardTitle>
              <CardDescription>
                เครื่องมือทดสอบ API ที่ทรงพลังและใช้งานง่าย
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 border-t border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            เข้าสู่ระบบและเริ่มจัดการ API ของคุณได้ทันที
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
