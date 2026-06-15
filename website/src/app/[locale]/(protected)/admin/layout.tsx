'use client';

import AdminGuard from '@/components/auth/AdminGuard';
import { Link, usePathname } from '@/navigation';
import { LayoutDashboardIcon, UsersIcon, ShieldAlertIcon, SettingsIcon, ArrowLeftIcon } from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboardIcon },
  { href: '/admin/users', label: 'Người dùng', icon: UsersIcon },
  { href: '/admin/posts', label: 'Kiểm duyệt', icon: ShieldAlertIcon },
  { href: '/admin/settings', label: 'Cài đặt', icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#080d14]">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-white/[0.05] bg-[#0c121c] flex flex-col shrink-0">
          <div className="p-6 border-b border-white/[0.05]">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500">
              Admin Portal
            </h2>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/[0.05]">
            <Link 
              href="/home"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
