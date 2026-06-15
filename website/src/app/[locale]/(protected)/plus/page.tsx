'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import { CheckCircleIcon, SparklesIcon, CrownIcon, ShieldCheckIcon, ZapIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: CrownIcon, title: 'Huy hiệu Độc Quyền', desc: 'Sở hữu huy hiệu PLUS lấp lánh cạnh tên bạn trên mọi bài viết.' },
  { icon: ZapIcon, title: 'Không Giới Hạn Dự Đoán', desc: 'Dự đoán kết quả cho tất cả các trận đấu mà không bị giới hạn 5 lần/ngày.' },
  { icon: SparklesIcon, title: 'Nhân Đôi XP (2x)', desc: 'Tăng cấp thần tốc với 2x kinh nghiệm mỗi khi dự đoán chính xác.' },
  { icon: UsersIcon, title: 'Tạo Cộng Đồng Riêng', desc: 'Trở thành Admin và xây dựng Fan Club của riêng bạn.' },
  { icon: ShieldCheckIcon, title: 'Ưu Tiên Hiển Thị', desc: 'Bình luận và bài viết của bạn sẽ được ưu tiên hiển thị lên đầu.' },
];

export default function PlusPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Chức năng thanh toán đang được tích hợp qua cổng VNPAY/Momo!', { icon: '💳' });
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-[#080d14] to-[#080d14] border-b border-amber-500/20 pt-16 pb-12 px-6 lg:px-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">
            💎
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 mb-4 tracking-tight">
            Nâng Tầm Đam Mê Với PLUS
          </h1>
          <p className="text-lg text-gray-400 max-w-xl">
            Trải nghiệm FootballVerse hoàn hảo nhất. Thể hiện đẳng cấp fan cuồng thực thụ, dự đoán thả ga và nhận vô vàn đặc quyền.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Đặc Quyền Hội Viên</h2>
              <div className="grid gap-6">
                {FEATURES.map((feat, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-200 mb-1">{feat.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="sticky top-24">
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] p-1">
              <div className="rounded-[22px] bg-[#0c121c] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Gói Cước Mùa Giải</h3>
                    <p className="text-sm text-gray-400">Thanh toán một lần, tận hưởng mãi mãi</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                    PHỔ BIẾN
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-white">49.000</span>
                    <span className="text-xl text-gray-500 font-medium pb-1">vnđ</span>
                  </div>
                  <p className="text-gray-400">/ 1 tháng (Tự động gia hạn)</p>
                </div>

                <div className="space-y-4 mb-8">
                  {['Hủy bất kỳ lúc nào', 'Hỗ trợ khách hàng 24/7', 'Không chứa quảng cáo'].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-300 font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                {user?.tier === 'PLUS' ? (
                  <button disabled className="w-full py-4 rounded-xl font-bold text-lg bg-white/10 text-gray-400 cursor-not-allowed">
                    Bạn đang là hội viên PLUS
                  </button>
                ) : (
                  <button 
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Đang xử lý...' : 'Nâng Cấp Ngay'}
                  </button>
                )}
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  Bằng việc đăng ký, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
