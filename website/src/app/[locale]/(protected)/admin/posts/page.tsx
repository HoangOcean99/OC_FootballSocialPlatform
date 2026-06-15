'use client';

export default function AdminPostsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Kiểm duyệt Nội dung</h1>
        <p className="text-gray-400">Quản lý bài viết, bình luận và báo cáo vi phạm</p>
      </div>

      <div className="bg-[#0c121c] border border-white/[0.05] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-400 max-w-md">
          Tính năng tự động quét từ ngữ vi phạm và AI kiểm duyệt hình ảnh đang được tích hợp. Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
}
