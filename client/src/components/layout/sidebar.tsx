import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Server, 
  PlayCircle, 
  Activity, 
  FileText, 
  BarChart3,
  Zap
} from "lucide-react";

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard },
  { name: 'จัดการ API', href: '/apis', icon: Server },
  { name: 'ทดสอบ API', href: '/test', icon: PlayCircle },
  { name: 'การตรวจสอบ', href: '/monitoring', icon: Activity },
  { name: 'เอกสาร API', href: '/docs', icon: FileText },
  { name: 'รายงานและสถิติ', href: '/analytics', icon: BarChart3 },
];

interface SidebarProps {
  user?: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo and Brand */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-slate-900">API Management</h1>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon className="mr-3 w-5 h-5" />
                {item.name}
              </a>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        {user && (
          <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
            <div className="flex items-center">
              <img 
                className="inline-block h-10 w-10 rounded-full object-cover" 
                src={user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
                alt="โปรไฟล์ผู้ใช้งาน" 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email || 'ผู้ใช้งาน'}
                </p>
                <p className="text-xs font-medium text-slate-500">Developer</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
