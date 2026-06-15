'use client';
import { Link } from '@/navigation';
import { ShieldAlertIcon, MailIcon, ArrowLeftIcon } from 'lucide-react';

export default function BannedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080d14] p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(239,68,68,1) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-md w-full bg-[#0c121c] border border-white/5 rounded-3xl p-8 md:p-10 text-center relative z-10 shadow-2xl shadow-red-500/10">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlertIcon className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Tài khoản bị khóa</h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          Tài khoản của bạn đã bị từ chối quyền truy cập vào hệ thống <span className="font-bold text-white">PitchGrid</span> do có dấu hiệu vi phạm Tiêu chuẩn cộng đồng của chúng tôi. 
          <br /><br />
          Mọi hành vi gian lận, spam, kích động thù địch hoặc lăng mạ người dùng khác đều sẽ bị xử lý nghiêm khắc.
        </p>

        <div className="space-y-3">
          <a 
            href="mailto:support@pitchgrid.com?subject=Kháng cáo khóa tài khoản&body=Chào ban quản trị PitchGrid,%0D%0A%0D%0ATôi muốn gửi yêu cầu xem xét lại việc khóa tài khoản của tôi.%0D%0ATên đăng nhập/Email: [Điền thông tin của bạn vào đây]%0D%0ALý do: "
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-[#0c121c] font-bold rounded-xl transition-colors shadow-lg"
          >
            <MailIcon className="w-5 h-5" />
            Liên hệ hỗ trợ / Kháng cáo
          </a>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
