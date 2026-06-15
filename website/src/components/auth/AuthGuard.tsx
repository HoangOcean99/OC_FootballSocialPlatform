'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give Zustand time to rehydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        clearAuth(); // Sync: if client says not logged in, clear any lingering cookies
        router.replace('/');
      } else if (user && !user.onboardingCompleted) {
        router.replace('/onboarding');
      }
      setChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 flex items-center justify-center animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {/* Wave Bouncing Text */}
          <style>{`
            @keyframes softWave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave {
              animation: softWave 1.2s ease-in-out infinite;
            }
          `}</style>
          <div className="mt-2 flex items-center justify-center">
            {['P', 'i', 't', 'c', 'h'].map((char, i) => (
              <span key={i} className="inline-block text-2xl font-black tracking-tight text-white animate-wave" style={{ animationDelay: `${i * 100}ms` }}>{char}</span>
            ))}
            {['G', 'r', 'i', 'd'].map((char, i) => (
              <span key={i + 5} className="inline-block text-2xl font-black tracking-tight text-emerald-400 animate-wave" style={{ animationDelay: `${(i + 5) * 100}ms` }}>{char}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
