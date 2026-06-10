import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#080d14]">
        <Navbar />
        <div className="flex max-w-screen-2xl mx-auto w-full">
          <Sidebar />
          <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
