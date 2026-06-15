'use client';

import { useEffect, useState } from 'react';
import { UsersIcon, CheckCircleIcon, MessageSquareIcon, TrendingUpIcon } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real app we'd attach the token. Since API Gateway handles JWT we'll assume it's passed or mocked.
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="text-gray-400">Đang tải số liệu...</div>;

  const WIDGETS = [
    { label: 'Tổng số người dùng', value: stats.totalUsers, icon: UsersIcon, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Hội viên PLUS', value: stats.plusUsers, icon: TrendingUpIcon, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Tổng bài viết', value: stats.totalPosts, icon: MessageSquareIcon, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Lượt dự đoán', value: stats.totalPredictions, icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-400">Số liệu cập nhật theo thời gian thực từ PitchGrid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {WIDGETS.map((w, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#0c121c] border border-white/[0.05] flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${w.bg} ${w.color}`}>
              <w.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">{w.label}</p>
              <h3 className="text-2xl font-bold text-white">{w.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-[#0c121c] border border-white/[0.05]">
        <h3 className="text-xl font-bold text-white mb-6">Trạng thái máy chủ</h3>
        <div className="flex items-center gap-4 text-sm text-emerald-400 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          Mọi hệ thống hoạt động bình thường
        </div>
      </div>
    </div>
  );
}
