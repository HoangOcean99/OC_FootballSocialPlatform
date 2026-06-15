'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!user) {
        router.replace('/');
      } else if (user.role !== 'ADMIN') {
        router.replace('/profile');
      }
    }
  }, [user, router, mounted]);

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
