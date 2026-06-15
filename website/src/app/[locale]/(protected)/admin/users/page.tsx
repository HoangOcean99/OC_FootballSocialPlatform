'use client';

import { useEffect, useState } from 'react';
import { Trash2Icon, CrownIcon, ArrowDownCircleIcon, ShieldCheckIcon, UserIcon, BanIcon, CheckCircle2Icon, FlagIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const MySwal = withReactContent(Swal);

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTier = async (id: string, newTier: 'REGULAR' | 'PLUS') => {
    try {
      await api.put(`/admin/users/${id}/tier`, { tier: newTier });
      toast.success(`Đã cập nhật hạng thẻ thành ${newTier}`);
      fetchUsers();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleUpdateRole = async (id: string, newRole: 'USER' | 'ADMIN') => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Đã cập nhật quyền thành ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleBan = async (id: string, isBanned: boolean) => {
    const actionText = isBanned ? 'khóa' : 'mở khóa';
    const result = await MySwal.fire({
      title: `Xác nhận ${actionText}?`,
      text: `Bạn có chắc chắn muốn ${actionText} người dùng này không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanned ? '#ef4444' : '#10b981',
      cancelButtonColor: '#374151',
      confirmButtonText: `Có, ${actionText}!`,
      cancelButtonText: 'Hủy bỏ',
      background: '#0c121c',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/users/${id}/ban`, { isBanned });
      toast.success(`Đã ${actionText} người dùng`);
      fetchUsers();
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Quản lý Người dùng</h1>
        <p className="text-gray-400">Danh sách toàn bộ thành viên trên hệ thống</p>
      </div>

      <div className="bg-[#0c121c] border border-white/[0.05] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.05] text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-medium">Tài khoản</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Vai trò</th>
                  <th className="px-6 py-4 font-medium text-center">Cấp độ (Lv)</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {user.initials || user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate max-w-[120px]">{user.username}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[150px]">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {user.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">ADMIN</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-500/20 text-gray-400">USER</span>
                        )}
                        {user.tier === 'PLUS' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 flex items-center gap-1 border border-amber-500/30">
                            <CrownIcon className="w-3 h-3" /> PLUS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">REGULAR</span>
                        )}
                        {user.isBanned && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1">
                            <FlagIcon className="w-3 h-3" /> BANNED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-300 font-medium whitespace-nowrap">Lv.{typeof user.level === 'number' ? user.level : (!isNaN(Number(user.level)) && user.level ? Number(user.level) : 1)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 flex-wrap">
                        {/* ROLE BTN */}
                        {user.role === 'USER' ? (
                          <button 
                            onClick={() => handleUpdateRole(user._id, 'ADMIN')}
                            className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                            title="Thăng quyền ADMIN"
                          >
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateRole(user._id, 'USER')}
                            className="p-1.5 bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-colors border border-gray-500/20"
                            title="Hạ quyền USER"
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* TIER BTN */}
                        {user.tier === 'REGULAR' ? (
                          <button 
                            onClick={() => handleUpdateTier(user._id, 'PLUS')}
                            className="p-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                            title="Nâng cấp PLUS"
                          >
                            <CrownIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateTier(user._id, 'REGULAR')}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
                            title="Hạ cấp REGULAR"
                          >
                            <ArrowDownCircleIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        {/* BAN BTN */}
                        {user.isBanned ? (
                          <button 
                            onClick={() => handleBan(user._id, false)}
                            className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 ml-1"
                            title="Mở khóa tài khoản"
                          >
                            <CheckCircle2Icon className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleBan(user._id, true)}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 ml-1"
                            title="Khóa tài khoản (Ban)"
                          >
                            <BanIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
