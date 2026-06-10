'use client';

export default function Loading() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#080d14]">
      {/* Logo */}
      <div className="relative flex items-center justify-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
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
      <div className="mt-4 flex items-center justify-center">
        {['P', 'i', 't', 'c', 'h'].map((char, i) => (
          <span key={i} className="inline-block text-2xl font-black tracking-tight text-white animate-wave" style={{ animationDelay: `${i * 100}ms` }}>{char}</span>
        ))}
        {['G', 'r', 'i', 'd'].map((char, i) => (
          <span key={i + 5} className="inline-block text-2xl font-black tracking-tight text-emerald-400 animate-wave" style={{ animationDelay: `${(i + 5) * 100}ms` }}>{char}</span>
        ))}
      </div>
    </div>
  );
}
