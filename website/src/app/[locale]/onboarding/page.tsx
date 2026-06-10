'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

const NATIONAL_TEAMS = [
  'Argentina', 'Brazil', 'France', 'England', 'Germany', 'Spain',
  'Portugal', 'Italy', 'Netherlands', 'Belgium', 'Croatia', 'Morocco',
  'Japan', 'South Korea', 'Australia', 'USA', 'Mexico', 'Colombia',
  'Uruguay', 'Chile', 'Vietnam', 'Thailand', 'Indonesia',
  'Saudi Arabia', 'Nigeria', 'Senegal', 'Egypt',
];

const CLUBS = [
  'Manchester United', 'Manchester City', 'Liverpool', 'Arsenal',
  'Chelsea', 'Tottenham Hotspur', 'Newcastle United', 'Aston Villa',
  'Real Madrid', 'Barcelona', 'Atletico Madrid',
  'Bayern Munich', 'Borussia Dortmund',
  'Juventus', 'Inter Milan', 'AC Milan', 'Napoli',
  'Paris Saint-Germain', 'Monaco',
  'Ajax', 'Benfica', 'Porto',
  'Hà Nội FC', 'Hồ Chí Minh City FC', 'Viettel FC',
];

const FLAG_MAP: Record<string, string> = {
  'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'England': '󠁧󠁢󠁥󠁮󠁧󠁿🏴',
  'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Italy': '🇮🇹',
  'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Morocco': '🇲🇦',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺', 'USA': '🇺🇸',
  'Mexico': '🇲🇽', 'Colombia': '🇨🇴', 'Uruguay': '🇺🇾', 'Chile': '🇨🇱',
  'Vietnam': '🇻🇳', 'Thailand': '🇹🇭', 'Indonesia': '🇮🇩', 'Saudi Arabia': '🇸🇦',
  'Nigeria': '🇳🇬', 'Senegal': '🇸🇳', 'Egypt': '🇪🇬',
};

type Step = 'username' | 'teams';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState(user?.username || '');
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedNational, setSelectedNational] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
    if (user?.onboardingCompleted) router.push('/home');
  }, [user, router]);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleFinish = async () => {
    if (selectedClubs.length === 0 && selectedNational.length === 0) {
      setError('Vui lòng chọn ít nhất 1 đội bóng yêu thích');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/onboarding', {
        userId: user?.id,
        username: username !== user?.username ? username : undefined,
        favoriteClubs: selectedClubs,
        favoriteNationalTeams: selectedNational,
      });
      if (data.error) { setError(data.error); return; }
      setAuth(data.user, data.access_token);
      router.push('/home');
    } catch {
      setError('Đã có lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain rounded-xl" />
            <span className="text-2xl font-bold tracking-tight">
              Pitch<span className="text-emerald-400">Grid</span>
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(['username', 'teams'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-emerald-500 text-white' :
                  (step === 'teams' && s === 'username') ? 'bg-emerald-500/30 text-emerald-400' :
                  'bg-white/10 text-gray-500'
                }`}>{i + 1}</div>
                {i < 1 && <div className={`w-12 h-0.5 ${step === 'teams' ? 'bg-emerald-500' : 'bg-white/10'} transition-all`} />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {step === 'username' ? 'Đặt username của bạn 👋' : 'Chọn đội bóng yêu thích ⚽'}
          </h1>
          <p className="text-gray-400">
            {step === 'username'
              ? 'Username là tên hiển thị của bạn trong cộng đồng PitchGrid'
              : 'Chọn ít nhất 1 đội bóng - có thể là đội tuyển, câu lạc bộ, hoặc cả hai!'}
          </p>
        </div>

        {/* Step 1: Username */}
        {step === 'username' && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                id="input-onboarding-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="ten_cua_ban"
                maxLength={20}
                className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-gray-600 rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <p className="text-gray-600 text-xs mt-2">3–20 ký tự, chỉ dùng chữ thường, số và _</p>

            {error && (
              <div className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">⚠️ {error}</div>
            )}

            <button
              id="btn-onboarding-next"
              onClick={() => {
                if (username.length < 3) { setError('Username phải có ít nhất 3 ký tự'); return; }
                setError('');
                setStep('teams');
              }}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              Tiếp theo →
            </button>
          </div>
        )}

        {/* Step 2: Choose Teams */}
        {step === 'teams' && (
          <div className="space-y-6">
            {/* National Teams */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                🌍 Đội tuyển quốc gia
                {selectedNational.length > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{selectedNational.length} đã chọn</span>
                )}
              </h3>
              <p className="text-gray-500 text-xs mb-4">Có thể chọn nhiều đội</p>
              <div className="flex flex-wrap gap-2">
                {NATIONAL_TEAMS.map((team) => (
                  <button
                    key={team}
                    onClick={() => setSelectedNational((prev) => toggle(prev, team))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedNational.includes(team)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.05] text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-200'
                    }`}
                  >
                    <span>{FLAG_MAP[team] || '🏳️'}</span>
                    <span>{team}</span>
                    {selectedNational.includes(team) && <span className="text-emerald-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Clubs */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                🏆 Câu lạc bộ
                {selectedClubs.length > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{selectedClubs.length} đã chọn</span>
                )}
              </h3>
              <p className="text-gray-500 text-xs mb-4">Có thể chọn nhiều câu lạc bộ</p>
              <div className="flex flex-wrap gap-2">
                {CLUBS.map((club) => (
                  <button
                    key={club}
                    onClick={() => setSelectedClubs((prev) => toggle(prev, club))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedClubs.includes(club)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.05] text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-200'
                    }`}
                  >
                    ⚽ {club}
                    {selectedClubs.includes(club) && <span className="text-emerald-400 ml-1">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">⚠️ {error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('username')}
                className="flex-1 bg-white/[0.06] hover:bg-white/10 text-gray-300 font-medium py-3 rounded-xl transition-all border border-white/10"
              >
                ← Quay lại
              </button>
              <button
                id="btn-onboarding-finish"
                onClick={handleFinish}
                disabled={loading}
                className="flex-[2] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : '🎉 Vào PitchGrid!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
