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

type Step = 'terms' | 'username' | 'teams';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
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
      if (data.error) { setError(data.error); setLoading(false); return; }
      setAuth(data.user, data.access_token);
      router.push('/home');
    } catch {
      setError('Đã có lỗi, vui lòng thử lại');
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
            {(['terms', 'username', 'teams'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-emerald-500 text-white' :
                  (['username', 'teams'].includes(step) && s === 'terms') || (step === 'teams' && s === 'username') ? 'bg-emerald-500/30 text-emerald-400' :
                  'bg-white/10 text-gray-500'
                }`}>{i + 1}</div>
                {i < 2 && <div className={`w-8 sm:w-12 h-0.5 ${(['username', 'teams'].includes(step) && s === 'terms') || (step === 'teams' && s === 'username') ? 'bg-emerald-500' : 'bg-white/10'} transition-all`} />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {step === 'terms' ? 'Điều khoản & Chính sách 📜' : step === 'username' ? 'Đặt username của bạn 👋' : 'Chọn đội bóng yêu thích ⚽'}
          </h1>
          <p className="text-gray-400">
            {step === 'terms'
              ? 'Vui lòng đọc kỹ và đồng ý với các quy định để tham gia cộng đồng'
              : step === 'username'
              ? 'Username là tên hiển thị của bạn trong cộng đồng PitchGrid'
              : 'Chọn ít nhất 1 đội bóng - có thể là đội tuyển, câu lạc bộ, hoặc cả hai!'}
          </p>
        </div>

        {/* Step 0: Terms */}
        {step === 'terms' && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 h-64 overflow-y-auto mb-6 text-sm text-gray-300 space-y-4">
              <h3 className="text-white font-bold text-base sticky top-0 bg-[#080d14] pb-2 z-10 pt-1 -mt-1">Điều khoản Dịch vụ của PitchGrid</h3>
              <p>Chào mừng bạn đến với PitchGrid - Mạng xã hội dành riêng cho người hâm mộ bóng đá.</p>
              
              <h4 className="text-emerald-400 font-semibold mt-4">1. Quy tắc ứng xử cộng đồng</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tôn trọng người hâm mộ của các đội bóng khác.</li>
                <li>Không sử dụng ngôn từ kích động, thù địch, phân biệt chủng tộc hoặc lăng mạ.</li>
                <li>Mọi hành vi spam, lừa đảo hoặc đăng tải nội dung không liên quan đến bóng đá sẽ bị khóa tài khoản ngay lập tức.</li>
              </ul>

              <h4 className="text-emerald-400 font-semibold mt-4">2. Quyền sở hữu nội dung</h4>
              <p>Bạn giữ toàn quyền sở hữu đối với nội dung bạn đăng tải. Tuy nhiên, bằng việc đăng tải, bạn cấp cho PitchGrid quyền hiển thị và phân phối nội dung đó trên nền tảng.</p>

              <h4 className="text-emerald-400 font-semibold mt-4">3. Quyền riêng tư (Privacy Policy)</h4>
              <p>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. PitchGrid không bán dữ liệu của bạn cho bên thứ ba. Dữ liệu của bạn được sử dụng hoàn toàn để tối ưu hóa trải nghiệm bảng tin và gợi ý kết nối.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mb-6">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="peer appearance-none w-5 h-5 rounded border-2 border-gray-500 bg-transparent checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer"
                />
                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors select-none">
                Tôi đã đọc và đồng ý với các <strong>Điều khoản Dịch vụ</strong> và <strong>Chính sách Bảo mật</strong> của PitchGrid.
              </span>
            </label>

            <button
              id="btn-onboarding-terms-next"
              onClick={() => setStep('username')}
              disabled={!termsAccepted}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đồng ý & Tiếp tục →
            </button>
          </div>
        )}

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

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('terms')}
                className="flex-1 bg-white/[0.06] hover:bg-white/10 text-gray-300 font-medium py-3 rounded-xl transition-all border border-white/10"
              >
                ← Quay lại
              </button>
              <button
                id="btn-onboarding-next"
              onClick={() => {
                if (username.length < 3) { setError('Username phải có ít nhất 3 ký tự'); return; }
                setError('');
                setStep('teams');
              }}
              className="flex-[2] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              Tiếp theo →
            </button>
            </div>
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
