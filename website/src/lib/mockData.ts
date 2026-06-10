// ============================================================
// FootballVerse — Mock Data
// ============================================================

export interface Team {
  name: string;
  shortName: string;
  logo: string; // emoji
  color: string; // tailwind color class
}

export interface LiveMatch {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  competition: string;
  competitionLogo: string;
  stadium: string;
  status: 'LIVE' | 'HT';
}

export interface UpcomingMatch {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string; // ISO string
  competition: string;
  competitionLogo: string;
  round: string;
}

export interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatarColor: string;
    initials: string;
    level: number;
    levelTitle: string;
  };
  community: {
    name: string;
    slug: string;
    emoji: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  tags: string[];
  isLiked: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string; // emoji
  memberCount: number;
  postsToday: number;
  category: string;
  isJoined: boolean;
  coverColor: string;
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  logo: string; // emoji
  country: string;
  season: string;
  teamsCount: number;
}

export interface Predictor {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  initials: string;
  level: number;
  levelTitle: string;
  accuracy: number;
  points: number;
  streak: number;
  rank: number;
}

// ============================================================
// LIVE MATCHES
// ============================================================
export const LIVE_MATCHES: LiveMatch[] = [
  {
    id: 'lm1',
    homeTeam: {
      name: 'Manchester City',
      shortName: 'MCI',
      logo: '🔵',
      color: 'text-sky-400',
    },
    awayTeam: {
      name: 'Arsenal',
      shortName: 'ARS',
      logo: '🔴',
      color: 'text-red-400',
    },
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    competition: 'Premier League',
    competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    stadium: 'Etihad Stadium',
    status: 'LIVE',
  },
  {
    id: 'lm2',
    homeTeam: {
      name: 'Real Madrid',
      shortName: 'RMA',
      logo: '⚪',
      color: 'text-white',
    },
    awayTeam: {
      name: 'Bayern Munich',
      shortName: 'BAY',
      logo: '🔴',
      color: 'text-red-500',
    },
    homeScore: 1,
    awayScore: 1,
    minute: 45,
    competition: 'UEFA Champions League',
    competitionLogo: '⭐',
    stadium: 'Santiago Bernabéu',
    status: 'HT',
  },
  {
    id: 'lm3',
    homeTeam: {
      name: 'FC Barcelona',
      shortName: 'BAR',
      logo: '🔵🔴',
      color: 'text-blue-500',
    },
    awayTeam: {
      name: 'Atletico Madrid',
      shortName: 'ATM',
      logo: '🔴⚪',
      color: 'text-red-600',
    },
    homeScore: 3,
    awayScore: 0,
    minute: 82,
    competition: 'La Liga',
    competitionLogo: '🇪🇸',
    stadium: 'Spotify Camp Nou',
    status: 'LIVE',
  },
];

// ============================================================
// UPCOMING MATCHES
// ============================================================
export const UPCOMING_MATCHES: UpcomingMatch[] = [
  {
    id: 'um1',
    homeTeam: {
      name: 'Liverpool',
      shortName: 'LIV',
      logo: '🔴',
      color: 'text-red-500',
    },
    awayTeam: {
      name: 'Chelsea',
      shortName: 'CHE',
      logo: '🔵',
      color: 'text-blue-500',
    },
    kickoff: '2026-06-10T19:45:00+07:00',
    competition: 'Premier League',
    competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    round: 'Vòng 36',
  },
  {
    id: 'um2',
    homeTeam: {
      name: 'PSG',
      shortName: 'PSG',
      logo: '🔵🔴',
      color: 'text-blue-600',
    },
    awayTeam: {
      name: 'Marseille',
      shortName: 'MAR',
      logo: '⚪🔵',
      color: 'text-sky-300',
    },
    kickoff: '2026-06-11T02:00:00+07:00',
    competition: 'Ligue 1',
    competitionLogo: '🇫🇷',
    round: 'Vòng 34',
  },
  {
    id: 'um3',
    homeTeam: {
      name: 'Juventus',
      shortName: 'JUV',
      logo: '⚫⚪',
      color: 'text-gray-300',
    },
    awayTeam: {
      name: 'AC Milan',
      shortName: 'MIL',
      logo: '🔴⚫',
      color: 'text-red-500',
    },
    kickoff: '2026-06-11T21:00:00+07:00',
    competition: 'Serie A',
    competitionLogo: '🇮🇹',
    round: 'Vòng 37',
  },
  {
    id: 'um4',
    homeTeam: {
      name: 'Borussia Dortmund',
      shortName: 'BVB',
      logo: '🟡',
      color: 'text-yellow-400',
    },
    awayTeam: {
      name: 'RB Leipzig',
      shortName: 'RBL',
      logo: '🔴⚪',
      color: 'text-red-400',
    },
    kickoff: '2026-06-12T21:30:00+07:00',
    competition: 'Bundesliga',
    competitionLogo: '🇩🇪',
    round: 'Vòng 33',
  },
  {
    id: 'um5',
    homeTeam: {
      name: 'Manchester United',
      shortName: 'MUN',
      logo: '🔴',
      color: 'text-red-600',
    },
    awayTeam: {
      name: 'Tottenham',
      shortName: 'TOT',
      logo: '⚪',
      color: 'text-slate-200',
    },
    kickoff: '2026-06-13T22:00:00+07:00',
    competition: 'Premier League',
    competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    round: 'Vòng 36',
  },
];

// ============================================================
// TRENDING POSTS
// ============================================================
export const TRENDING_POSTS: Post[] = [
  {
    id: 'p1',
    author: {
      username: 'reddevil_vietnam',
      displayName: 'Red Devil VN',
      avatarColor: 'bg-red-600',
      initials: 'RD',
      level: 15,
      levelTitle: 'Fan Cuồng',
    },
    community: {
      name: 'Fan MU Việt Nam',
      slug: 'fan-mu-vn',
      emoji: '🔴',
    },
    content:
      'Rashford đêm qua đỉnh quá! Hat-trick mà không cần penalty 🔥🔥🔥 Con người này khi được trao cơ hội đúng chỗ thật sự là world class. Hy vọng mùa tới MU sẽ đầu tư thêm vào hàng công!',
    likes: 1247,
    comments: 89,
    shares: 34,
    timeAgo: '2 giờ trước',
    tags: ['ManchesterUnited', 'Rashford', 'PremierLeague'],
    isLiked: true,
  },
  {
    id: 'p2',
    author: {
      username: 'ucl_analyst',
      displayName: 'UCL Analyst',
      avatarColor: 'bg-blue-600',
      initials: 'UA',
      level: 22,
      levelTitle: 'Chuyên Gia',
    },
    community: {
      name: 'UEFA Champions League',
      slug: 'ucl',
      emoji: '⭐',
    },
    content:
      'Phân tích tactical: Real Madrid đang sử dụng high press 4-3-3 rất hiệu quả trong hiệp 2. Bellingham đóng vai trò box-to-box xuất sắc, cover cho Modric đã 38 tuổi. Vinicius Jr là mối đe doạ liên tục từ cánh trái...',
    likes: 2891,
    comments: 156,
    shares: 78,
    timeAgo: '4 giờ trước',
    tags: ['RealMadrid', 'UCL', 'Tactical', 'Bellingham'],
    isLiked: false,
  },
  {
    id: 'p3',
    author: {
      username: 'barca_forever',
      displayName: 'Barça Forever',
      avatarColor: 'bg-purple-600',
      initials: 'BF',
      level: 18,
      levelTitle: 'Tín Đồ',
    },
    community: {
      name: 'FC Barcelona',
      slug: 'barcelona',
      emoji: '🔵🔴',
    },
    content:
      'Lamine Yamal 18 tuổi mà chơi như thế này... Messi reincarnated? 😭 Cậu bé này sinh ra để chơi bóng đá. Camp Nou tối nay cuồng nhiệt lắm, không khí thật sự tuyệt vời! Visca el Barça! 💙❤️',
    likes: 3456,
    comments: 234,
    shares: 112,
    timeAgo: '1 giờ trước',
    tags: ['Barcelona', 'Yamal', 'LaLiga', 'ElClasico'],
    isLiked: false,
  },
  {
    id: 'p4',
    author: {
      username: 'klopp_disciple',
      displayName: 'Klopp Disciple',
      avatarColor: 'bg-amber-600',
      initials: 'KD',
      level: 11,
      levelTitle: 'Người Hâm Mộ',
    },
    community: {
      name: 'Liverpool FC',
      slug: 'liverpool',
      emoji: '🔴',
    },
    content:
      'Slot đang làm rất tốt nhưng mình vẫn nhớ Klopp vô cùng 😢 Dù sao thì Liverpool vẫn là Liverpool, tinh thần YNWA không bao giờ tắt. Salah ở lại thêm 1 mùa nữa là quá đỉnh rồi! 🙌',
    likes: 891,
    comments: 67,
    shares: 23,
    timeAgo: '5 giờ trước',
    tags: ['Liverpool', 'YNWA', 'Salah'],
    isLiked: true,
  },
  {
    id: 'p5',
    author: {
      username: 'argentina_azul',
      displayName: 'Argentina Azul',
      avatarColor: 'bg-sky-600',
      initials: 'AA',
      level: 19,
      levelTitle: 'Tín Đồ',
    },
    community: {
      name: 'Argentina National Team',
      slug: 'argentina',
      emoji: '🇦🇷',
    },
    content:
      'Messi vừa ghi bàn thứ 900 trong sự nghiệp chuyên nghiệp!!! Không phải con người, đây là sinh vật ngoài hành tinh 👽⚽ Cảm ơn vì tất cả Leo, mãi là số 1 trong tim tôi. GOAT FOREVER! 🐐',
    likes: 8923,
    comments: 567,
    shares: 445,
    timeAgo: '30 phút trước',
    tags: ['Messi', 'GOAT', 'Argentina', 'Milestone'],
    isLiked: false,
  },
];

// ============================================================
// TOP COMMUNITIES
// ============================================================
export const TOP_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'Man United Việt Nam',
    slug: 'man-united-vn',
    description: 'Cộng đồng fan Manchester United lớn nhất Việt Nam. GGMU!',
    logo: '🔴',
    memberCount: 128540,
    postsToday: 234,
    category: 'Club',
    isJoined: true,
    coverColor: 'from-red-900 to-red-700',
  },
  {
    id: 'c2',
    name: 'Liverpool FC Vietnam',
    slug: 'liverpool-vn',
    description: 'You\'ll Never Walk Alone. Cộng đồng fan The Kop tại Việt Nam.',
    logo: '⚽',
    memberCount: 98320,
    postsToday: 187,
    category: 'Club',
    isJoined: false,
    coverColor: 'from-red-800 to-orange-700',
  },
  {
    id: 'c3',
    name: 'Real Madrid Fans',
    slug: 'real-madrid',
    description: 'Hala Madrid! Nơi hội tụ của Los Blancos fan toàn cầu.',
    logo: '👑',
    memberCount: 215670,
    postsToday: 312,
    category: 'Club',
    isJoined: false,
    coverColor: 'from-slate-700 to-purple-900',
  },
  {
    id: 'c4',
    name: 'UEFA Champions League',
    slug: 'ucl',
    description: 'Thảo luận về giải đấu câu lạc bộ danh giá nhất châu Âu.',
    logo: '⭐',
    memberCount: 345210,
    postsToday: 567,
    category: 'Competition',
    isJoined: true,
    coverColor: 'from-blue-900 to-indigo-800',
  },
  {
    id: 'c5',
    name: 'Argentina Fans',
    slug: 'argentina',
    description: 'Vamos Argentina! Theo dõi La Albiceleste đến World Cup.',
    logo: '🇦🇷',
    memberCount: 187430,
    postsToday: 423,
    category: 'National',
    isJoined: false,
    coverColor: 'from-sky-800 to-blue-700',
  },
  {
    id: 'c6',
    name: 'Fan MU VN Official',
    slug: 'fan-mu-vn-official',
    description: 'Fanpage chính thức của Fan MU Việt Nam. Cập nhật tin tức 24/7.',
    logo: '🏆',
    memberCount: 76890,
    postsToday: 145,
    category: 'Club',
    isJoined: true,
    coverColor: 'from-red-900 to-rose-800',
  },
];

// ============================================================
// COMPETITIONS
// ============================================================
export const COMPETITIONS: Competition[] = [
  {
    id: 'comp1',
    name: 'FIFA World Cup 2026',
    shortName: 'World Cup',
    logo: '🏆',
    country: 'International',
    season: '2026',
    teamsCount: 48,
  },
  {
    id: 'comp2',
    name: 'Premier League',
    shortName: 'PL',
    logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    country: 'England',
    season: '2025/26',
    teamsCount: 20,
  },
  {
    id: 'comp3',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    logo: '⭐',
    country: 'Europe',
    season: '2025/26',
    teamsCount: 36,
  },
  {
    id: 'comp4',
    name: 'La Liga',
    shortName: 'LaLiga',
    logo: '🇪🇸',
    country: 'Spain',
    season: '2025/26',
    teamsCount: 20,
  },
  {
    id: 'comp5',
    name: 'Bundesliga',
    shortName: 'BL',
    logo: '🇩🇪',
    country: 'Germany',
    season: '2025/26',
    teamsCount: 18,
  },
  {
    id: 'comp6',
    name: 'Serie A',
    shortName: 'SA',
    logo: '🇮🇹',
    country: 'Italy',
    season: '2025/26',
    teamsCount: 20,
  },
  {
    id: 'comp7',
    name: 'Ligue 1',
    shortName: 'L1',
    logo: '🇫🇷',
    country: 'France',
    season: '2025/26',
    teamsCount: 18,
  },
  {
    id: 'comp8',
    name: 'V.League 1',
    shortName: 'VL1',
    logo: '🇻🇳',
    country: 'Vietnam',
    season: '2025/26',
    teamsCount: 14,
  },
];

// ============================================================
// TOP PREDICTORS
// ============================================================
export const TOP_PREDICTORS: Predictor[] = [
  {
    id: 'pred1',
    username: 'oracle_football',
    displayName: 'Oracle Football',
    avatarColor: 'bg-emerald-600',
    initials: 'OF',
    level: 30,
    levelTitle: 'Tiên Tri',
    accuracy: 87.4,
    points: 12840,
    streak: 12,
    rank: 1,
  },
  {
    id: 'pred2',
    username: 'stats_master_vn',
    displayName: 'Stats Master VN',
    avatarColor: 'bg-violet-600',
    initials: 'SM',
    level: 28,
    levelTitle: 'Phù Thuỷ',
    accuracy: 84.1,
    points: 11230,
    streak: 8,
    rank: 2,
  },
  {
    id: 'pred3',
    username: 'football_wizard',
    displayName: 'Football Wizard',
    avatarColor: 'bg-amber-600',
    initials: 'FW',
    level: 25,
    levelTitle: 'Chuyên Gia',
    accuracy: 81.7,
    points: 9870,
    streak: 5,
    rank: 3,
  },
  {
    id: 'pred4',
    username: 'tactical_genius',
    displayName: 'Tactical Genius',
    avatarColor: 'bg-rose-600',
    initials: 'TG',
    level: 23,
    levelTitle: 'Chuyên Gia',
    accuracy: 79.3,
    points: 8540,
    streak: 3,
    rank: 4,
  },
  {
    id: 'pred5',
    username: 'vn_football_pro',
    displayName: 'VN Football Pro',
    avatarColor: 'bg-sky-600',
    initials: 'VP',
    level: 21,
    levelTitle: 'Tín Đồ',
    accuracy: 77.8,
    points: 7230,
    streak: 6,
    rank: 5,
  },
];

// Helper: format kickoff time
export function formatKickoff(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Hôm nay ${timeStr}`;
  if (diffDays === 1) return `Ngày mai ${timeStr}`;
  return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
}

// Helper: format large numbers
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ============================================================
// COMMUNITIES PAGE DATA
// ============================================================
export interface CommunityCard {
  id: string;
  name: string;
  description: string;
  emoji: string;
  banner: string; // tailwind gradient classes
  members: number;
  postsPerDay: number;
  tags: string[];
  category: 'team' | 'competition' | 'fanmade';
  joined: boolean;
}

export const COMMUNITY_CARDS: CommunityCard[] = [
  {
    id: 'cc1', name: 'Man United FC', emoji: '🔴',
    description: 'Cộng đồng fan chính thức của Manchester United tại Việt Nam. Cập nhật tin tức, kết quả và phân tích mới nhất.',
    banner: 'from-red-900 via-red-800 to-rose-900',
    members: 48230, postsPerDay: 124,
    tags: ['#manu', '#premierleague', '#ggmu'], category: 'team', joined: true,
  },
  {
    id: 'cc2', name: 'Liverpool FC', emoji: '🦅',
    description: "You'll Never Walk Alone! Hội fan Liverpool – cập nhật 24/7 về The Reds, Anfield và kỷ nguyên mới.",
    banner: 'from-red-700 via-red-600 to-orange-800',
    members: 52100, postsPerDay: 156,
    tags: ['#liverpool', '#lfc', '#ynwa'], category: 'team', joined: false,
  },
  {
    id: 'cc3', name: 'Real Madrid CF', emoji: '👑',
    description: 'Hala Madrid! Cộng đồng fan Real Madrid – theo dõi mọi diễn biến của Los Blancos tại La Liga & UCL.',
    banner: 'from-purple-900 via-indigo-900 to-blue-900',
    members: 71500, postsPerDay: 203,
    tags: ['#realmadrid', '#halamadrid', '#laliga'], category: 'team', joined: true,
  },
  {
    id: 'cc4', name: 'FC Barcelona', emoji: '💎',
    description: 'Més que un club! Nơi hội tụ của Blaugrana fans – Barça tin tức, phân tích chiến thuật và tranh luận sôi nổi.',
    banner: 'from-blue-900 via-blue-800 to-indigo-900',
    members: 68900, postsPerDay: 187,
    tags: ['#barcelona', '#barca', '#laliga'], category: 'team', joined: false,
  },
  {
    id: 'cc5', name: 'Arsenal FC', emoji: '⚡',
    description: 'We are the Arsenal! Theo dõi The Gunners cùng cộng đồng fan Việt Nam. COYG!',
    banner: 'from-red-800 via-red-700 to-amber-900',
    members: 31200, postsPerDay: 89,
    tags: ['#arsenal', '#coyg', '#premierleague'], category: 'team', joined: false,
  },
  {
    id: 'cc6', name: 'Bayern München', emoji: '🦁',
    description: 'Mia san mia! Cộng đồng fan Bayern Munich – Bundesliga, UCL và mọi thứ liên quan đến Die Roten.',
    banner: 'from-red-900 via-rose-800 to-red-700',
    members: 28700, postsPerDay: 76,
    tags: ['#bayernmunich', '#bundesliga', '#miasanmia'], category: 'team', joined: false,
  },
  {
    id: 'cc7', name: 'UEFA Champions League', emoji: '🏆',
    description: 'Đây là nơi cảm nhận đỉnh cao bóng đá châu Âu. UCL – giải đấu danh giá nhất hành tinh.',
    banner: 'from-blue-950 via-indigo-900 to-violet-900',
    members: 120400, postsPerDay: 342,
    tags: ['#ucl', '#championsleague', '#football'], category: 'competition', joined: true,
  },
  {
    id: 'cc8', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: 'No Other League! Theo dõi toàn bộ giải Ngoại Hạng Anh – kết quả, BXH, phân tích và gossip.',
    banner: 'from-violet-900 via-purple-900 to-indigo-800',
    members: 95300, postsPerDay: 268,
    tags: ['#premierleague', '#epl', '#football'], category: 'competition', joined: false,
  },
  {
    id: 'cc9', name: 'Fan MU Việt Nam', emoji: '🇻🇳',
    description: 'Hội fan Man United lớn nhất Việt Nam! Xem trận cùng nhau, tranh luận chiến thuật, chia sẻ tình yêu GGMU.',
    banner: 'from-red-950 via-red-900 to-rose-950',
    members: 15600, postsPerDay: 67,
    tags: ['#fanmuvn', '#manu', '#ggmu', '#vietnam'], category: 'fanmade', joined: true,
  },
  {
    id: 'cc10', name: 'Hội Xem C1 Đêm Khuya', emoji: '🌙',
    description: 'Dành cho những chiến binh thức khuya xem Champions League. Coffee ☕ + Bóng đá 🏆 = Hạnh phúc.',
    banner: 'from-slate-900 via-blue-950 to-indigo-950',
    members: 8900, postsPerDay: 234,
    tags: ['#ucl', '#demkhuya', '#thuckhuyaxembongda'], category: 'fanmade', joined: true,
  },
  {
    id: 'cc11', name: 'Fan Messi VN', emoji: '🐐',
    description: 'GOAT forever! Cộng đồng yêu Messi tại Việt Nam – theo dõi La Pulga từ Barca đến Inter Miami.',
    banner: 'from-sky-900 via-blue-900 to-cyan-900',
    members: 22100, postsPerDay: 45,
    tags: ['#messi', '#goat', '#m10', '#fanvn'], category: 'fanmade', joined: false,
  },
  {
    id: 'cc12', name: 'Fan Bóng Đá Hà Nội', emoji: '🏙️',
    description: 'Cộng đồng fan bóng đá tại Hà Nội – tổ chức xem trận tập thể, giao lưu fan và chia sẻ niềm đam mê.',
    banner: 'from-emerald-950 via-teal-900 to-green-950',
    members: 6400, postsPerDay: 28,
    tags: ['#hanoi', '#bongda', '#vietnam', '#community'], category: 'fanmade', joined: false,
  },
];

// ============================================================
// PROFILE PAGE DATA
// ============================================================
export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserActivity {
  id: string;
  type: 'match_watched' | 'prediction' | 'post' | 'joined_community' | 'achievement';
  title: string;
  detail: string;
  time: string;
  xp?: number;
}

export const USER_PROFILE = {
  username: 'HoangOcean',
  displayName: 'Hoàng Ocean',
  initials: 'HO',
  level: 18,
  levelName: '🌟 Super Fan',
  xp: 4720,
  xpToNextLevel: 5000,
  joinDate: 'Tháng 3, 2024',
  stats: { posts: 142, comments: 893, correctPredictions: 67, matchesWatched: 214 },
  predictionStats: { total: 98, correct: 67, accuracy: 68.4, streak: 5, bestStreak: 12, xpEarned: 3240 },
  favoriteTeams: ['Man United', 'Real Madrid', 'Barca B'],
  achievements: [
    { id: 'a1', icon: '🌱', name: 'Rookie Fan', description: 'Tham gia PitchGrid', unlocked: true, rarity: 'common' },
    { id: 'a2', icon: '🎯', name: 'First Prediction', description: 'Dự đoán đúng lần đầu', unlocked: true, rarity: 'common' },
    { id: 'a3', icon: '🔥', name: 'On Fire', description: 'Dự đoán đúng 5 lần liên tiếp', unlocked: true, rarity: 'rare' },
    { id: 'a4', icon: '👥', name: 'Social Butterfly', description: 'Tham gia 5 cộng đồng', unlocked: true, rarity: 'rare' },
    { id: 'a5', icon: '📰', name: 'Blogger', description: 'Đăng 100 bài viết', unlocked: true, rarity: 'rare' },
    { id: 'a6', icon: '⚡', name: 'Active Member', description: 'Hoạt động 30 ngày liên tiếp', unlocked: true, rarity: 'epic' },
    { id: 'a7', icon: '🏆', name: 'Top Predictor', description: 'Vào top 10 BXH dự đoán', unlocked: false, rarity: 'epic' },
    { id: 'a8', icon: '👑', name: 'Legend', description: 'Đạt level 30', unlocked: false, rarity: 'legendary' },
    { id: 'a9', icon: '💎', name: 'Diamond Fan', description: 'Dự đoán đúng 200 trận', unlocked: false, rarity: 'legendary' },
  ] as Achievement[],
  recentActivity: [
    { id: 'act1', type: 'prediction', title: 'Dự đoán đúng!', detail: 'Man Utd 2 - 1 Arsenal', time: '2 giờ trước', xp: 50 },
    { id: 'act2', type: 'match_watched', title: 'Đã xem trận đấu', detail: 'Real Madrid vs Bayern Munich (UCL)', time: '1 ngày trước', xp: 10 },
    { id: 'act3', type: 'post', title: 'Đăng bài mới', detail: 'Phân tích chiến thuật Slot tại Liverpool', time: '2 ngày trước', xp: 20 },
    { id: 'act4', type: 'joined_community', title: 'Tham gia cộng đồng', detail: 'Hội Xem C1 Đêm Khuya', time: '3 ngày trước', xp: 15 },
    { id: 'act5', type: 'achievement', title: 'Mở khóa thành tích', detail: 'Active Member – Hoạt động 30 ngày liên tiếp', time: '5 ngày trước', xp: 100 },
  ] as UserActivity[],
  journal: [
    { date: '09/06', matches: ['Man Utd vs Arsenal'], predictions: 1, posts: 0 },
    { date: '08/06', matches: ['UCL: Real Madrid vs Bayern'], predictions: 2, posts: 1 },
    { date: '07/06', matches: ['Liverpool vs Chelsea'], predictions: 1, posts: 0 },
    { date: '06/06', matches: [], predictions: 0, posts: 2 },
    { date: '05/06', matches: ['Barcelona vs Atletico'], predictions: 1, posts: 1 },
  ],
  joinedCommunities: ['Man United FC', 'Real Madrid CF', 'Fan MU Việt Nam', 'Hội Xem C1 Đêm Khuya', 'UEFA Champions League'],
  communityEmojis: ['🔴', '👑', '🇻🇳', '🌙', '🏆'],
};

// ============================================================
// PREDICTIONS PAGE DATA
// ============================================================
export interface PredMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeEmoji: string;
  awayEmoji: string;
  competition: string;
  kickoff: string;
  xpReward: number;
}

export interface MyPred {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeEmoji: string;
  awayEmoji: string;
  competition: string;
  prediction: 'home' | 'draw' | 'away';
  scoreHome: number;
  scoreAway: number;
  result?: 'win' | 'loss' | 'pending';
  actualScore?: string;
  xpEarned?: number;
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  initials: string;
  color: string;
  level: number;
  levelName: string;
  correct: number;
  total: number;
  accuracy: number;
  xp: number;
  isCurrentUser?: boolean;
}

export const PRED_MATCHES: PredMatch[] = [
  { id: 'pm1', homeTeam: 'Man United', awayTeam: 'Tottenham', homeEmoji: '🔴', awayEmoji: '⚪', competition: 'Premier League', kickoff: 'T7, 14/06 · 21:00', xpReward: 50 },
  { id: 'pm2', homeTeam: 'Real Madrid', awayTeam: 'Liverpool', homeEmoji: '👑', awayEmoji: '🦅', competition: 'UEFA Champions League', kickoff: 'T4, 11/06 · 02:00', xpReward: 100 },
  { id: 'pm3', homeTeam: 'Barcelona', awayTeam: 'Atlético Madrid', homeEmoji: '💎', awayEmoji: '🔵', competition: 'La Liga', kickoff: 'CN, 15/06 · 22:00', xpReward: 50 },
  { id: 'pm4', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', homeEmoji: '🦁', awayEmoji: '💛', competition: 'Bundesliga', kickoff: 'T7, 14/06 · 23:30', xpReward: 50 },
  { id: 'pm5', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeEmoji: '⚡', awayEmoji: '💙', competition: 'Premier League', kickoff: 'CN, 15/06 · 19:30', xpReward: 50 },
  { id: 'pm6', homeTeam: 'PSG', awayTeam: 'Inter Milan', homeEmoji: '🗼', awayEmoji: '🖤', competition: 'UEFA Champions League', kickoff: 'T4, 11/06 · 02:00', xpReward: 100 },
];

export const MY_PREDICTIONS: MyPred[] = [
  { id: 'mp1', homeTeam: 'Man Utd', awayTeam: 'Arsenal', homeEmoji: '🔴', awayEmoji: '⚡', competition: 'Premier League', prediction: 'home', scoreHome: 2, scoreAway: 1, result: 'win', actualScore: '2-1', xpEarned: 50, date: '09/06' },
  { id: 'mp2', homeTeam: 'Liverpool', awayTeam: 'Chelsea', homeEmoji: '🦅', awayEmoji: '💙', competition: 'Premier League', prediction: 'home', scoreHome: 3, scoreAway: 1, result: 'win', actualScore: '2-0', xpEarned: 30, date: '08/06' },
  { id: 'mp3', homeTeam: 'Real Madrid', awayTeam: 'Barca', homeEmoji: '👑', awayEmoji: '💎', competition: 'La Liga', prediction: 'draw', scoreHome: 1, scoreAway: 1, result: 'loss', actualScore: '3-2', xpEarned: 0, date: '07/06' },
  { id: 'mp4', homeTeam: 'Bayern', awayTeam: 'PSG', homeEmoji: '🦁', awayEmoji: '🗼', competition: 'UCL', prediction: 'home', scoreHome: 2, scoreAway: 0, result: 'win', actualScore: '2-0', xpEarned: 100, date: '05/06' },
  { id: 'mp5', homeTeam: 'Man City', awayTeam: 'Tottenham', homeEmoji: '🔵', awayEmoji: '⚪', competition: 'Premier League', prediction: 'home', scoreHome: 2, scoreAway: 1, result: 'pending', date: '10/06' },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'ProPredictor99', displayName: 'Minh Quân', initials: 'MQ', color: 'from-yellow-500 to-amber-600', level: 32, levelName: '👑 Legend', correct: 187, total: 212, accuracy: 88.2, xp: 12450 },
  { rank: 2, username: 'BallWatcher', displayName: 'Trần Hùng', initials: 'TH', color: 'from-slate-400 to-slate-500', level: 28, levelName: '⭐ Expert', correct: 156, total: 184, accuracy: 84.8, xp: 9870 },
  { rank: 3, username: 'GoalOracle', displayName: 'Anh Khoa', initials: 'AK', color: 'from-orange-600 to-amber-700', level: 25, levelName: '🔥 Veteran', correct: 142, total: 171, accuracy: 83.0, xp: 8920 },
  { rank: 4, username: 'TacticMaster', displayName: 'Đức Long', initials: 'ĐL', color: 'from-emerald-500 to-teal-600', level: 22, levelName: '💫 Pro', correct: 128, total: 158, accuracy: 81.0, xp: 7650 },
  { rank: 5, username: 'MatchAnalyst', displayName: 'Phúc Hải', initials: 'PH', color: 'from-blue-500 to-indigo-600', level: 21, levelName: '💫 Pro', correct: 115, total: 143, accuracy: 80.4, xp: 6980 },
  { rank: 6, username: 'SoccerSage', displayName: 'Văn Nam', initials: 'VN', color: 'from-purple-500 to-violet-600', level: 20, levelName: '💫 Pro', correct: 109, total: 138, accuracy: 79.0, xp: 6420 },
  { rank: 7, username: 'FootballGuru', displayName: 'Bảo Châu', initials: 'BC', color: 'from-rose-500 to-pink-600', level: 19, levelName: '🌟 Super Fan', correct: 98, total: 125, accuracy: 78.4, xp: 5870 },
  { rank: 8, username: 'HoangOcean', displayName: 'Hoàng Ocean', initials: 'HO', color: 'from-emerald-400 to-green-600', level: 18, levelName: '🌟 Super Fan', correct: 67, total: 98, accuracy: 68.4, xp: 4720, isCurrentUser: true },
  { rank: 9, username: 'GoalSeeker', displayName: 'Tiến Đạt', initials: 'TĐ', color: 'from-cyan-500 to-teal-600', level: 17, levelName: '🌟 Super Fan', correct: 79, total: 118, accuracy: 66.9, xp: 4320 },
  { rank: 10, username: 'PremierPick', displayName: 'Quốc Bảo', initials: 'QB', color: 'from-red-500 to-rose-600', level: 16, levelName: '⚡ Rising Star', correct: 72, total: 110, accuracy: 65.5, xp: 3980 },
];
