'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (user?.username) {
      router.replace(`/profile/${user.username}`);
    } else {
      router.replace('/login');
    }
  }, [user, router, mounted]);

  return (
    <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
