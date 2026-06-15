import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/footballverse';

const LIVE_MATCHES = [
  {
    homeTeam: { name: 'Manchester City', shortName: 'MCI', logo: '🔵', color: 'text-sky-400' },
    awayTeam: { name: 'Arsenal', shortName: 'ARS', logo: '🔴', color: 'text-red-400' },
    homeScore: 2, awayScore: 1, minute: 67,
    kickoff: new Date().toISOString(),
    competition: 'Premier League', competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    stadium: 'Etihad Stadium', status: 'LIVE'
  },
  {
    homeTeam: { name: 'Real Madrid', shortName: 'RMA', logo: '⚪', color: 'text-white' },
    awayTeam: { name: 'Bayern Munich', shortName: 'BAY', logo: '🔴', color: 'text-red-500' },
    homeScore: 1, awayScore: 1, minute: 45,
    kickoff: new Date().toISOString(),
    competition: 'UEFA Champions League', competitionLogo: '⭐',
    stadium: 'Santiago Bernabéu', status: 'HT'
  },
  {
    homeTeam: { name: 'FC Barcelona', shortName: 'BAR', logo: '🔵🔴', color: 'text-blue-500' },
    awayTeam: { name: 'Atletico Madrid', shortName: 'ATM', logo: '🔴⚪', color: 'text-red-600' },
    homeScore: 3, awayScore: 0, minute: 82,
    kickoff: new Date().toISOString(),
    competition: 'La Liga', competitionLogo: '🇪🇸',
    stadium: 'Spotify Camp Nou', status: 'LIVE'
  }
];

const UPCOMING_MATCHES = [
  {
    homeTeam: { name: 'Liverpool', shortName: 'LIV', logo: '🔴', color: 'text-red-500' },
    awayTeam: { name: 'Chelsea', shortName: 'CHE', logo: '🔵', color: 'text-blue-500' },
    kickoff: '2026-06-10T19:45:00+07:00',
    competition: 'Premier League', competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', round: 'Vòng 36', status: 'SCHEDULED'
  },
  {
    homeTeam: { name: 'PSG', shortName: 'PSG', logo: '🔵🔴', color: 'text-blue-600' },
    awayTeam: { name: 'Marseille', shortName: 'MAR', logo: '⚪🔵', color: 'text-sky-300' },
    kickoff: '2026-06-11T02:00:00+07:00',
    competition: 'Ligue 1', competitionLogo: '🇫🇷', round: 'Vòng 34', status: 'SCHEDULED'
  }
];

const FINISHED_MATCHES = [
  {
    homeTeam: { name: 'Bayern Munich', shortName: 'BAY', logo: '🔴', color: 'text-red-500' },
    awayTeam: { name: 'Dortmund', shortName: 'BVB', logo: '🟡', color: 'text-yellow-400' },
    homeScore: 3,
    awayScore: 0,
    kickoff: '2026-06-08T20:00:00+07:00',
    competition: 'Bundesliga',
    competitionLogo: '🇩🇪',
    status: 'FINISHED',
  },
  {
    homeTeam: { name: 'Juventus', shortName: 'JUV', logo: '⚫', color: 'text-gray-300' },
    awayTeam: { name: 'AC Milan', shortName: 'MIL', logo: '🔴', color: 'text-red-500' },
    homeScore: 1,
    awayScore: 2,
    kickoff: '2026-06-07T21:00:00+07:00',
    competition: 'Serie A',
    competitionLogo: '🇮🇹',
    status: 'FINISHED',
  }
];

const TRENDING_POSTS = [
  {
    author: { username: 'reddevil_vietnam', displayName: 'Red Devil VN', avatarColor: 'bg-red-600', initials: 'RD', level: 15, levelTitle: 'Fan Cuồng' },
    community: { name: 'Fan MU Việt Nam', slug: 'fan-mu-vn', emoji: '🔴' },
    content: 'Rashford đêm qua đỉnh quá! Hat-trick mà không cần penalty 🔥🔥🔥 Con người này khi được trao cơ hội đúng chỗ thật sự là world class. Hy vọng mùa tới MU sẽ đầu tư thêm vào hàng công!',
    likes: 1247, comments: 89, shares: 34, timeAgo: '2 giờ trước', tags: ['ManchesterUnited', 'Rashford', 'PremierLeague'], isLiked: true
  },
  {
    author: { username: 'ucl_analyst', displayName: 'UCL Analyst', avatarColor: 'bg-blue-600', initials: 'UA', level: 22, levelTitle: 'Chuyên Gia' },
    community: { name: 'UEFA Champions League', slug: 'ucl', emoji: '⭐' },
    content: 'Phân tích tactical: Real Madrid đang sử dụng high press 4-3-3 rất hiệu quả trong hiệp 2. Bellingham đóng vai trò box-to-box xuất sắc, cover cho Modric đã 38 tuổi. Vinicius Jr là mối đe doạ liên tục từ cánh trái...',
    likes: 2891, comments: 156, shares: 78, timeAgo: '4 giờ trước', tags: ['RealMadrid', 'UCL', 'Tactical', 'Bellingham'], isLiked: false
  }
];

const TOP_COMMUNITIES = [
  { name: 'Man United FC', slug: 'man-united-vn', description: 'Cộng đồng fan chính thức của Manchester United tại Việt Nam.', logo: '🔴', coverColor: 'from-red-900 to-rose-900', cover: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop', members: '48.2K', posts: '124', category: 'team', isJoined: true },
  { name: 'Liverpool FC', slug: 'liverpool-vn', description: 'You\'ll Never Walk Alone! Hội fan Liverpool.', logo: '🦅', coverColor: 'from-red-700 to-orange-800', cover: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba6?q=80&w=800&auto=format&fit=crop', members: '52.1K', posts: '156', category: 'team', isJoined: false },
  { name: 'Real Madrid CF', slug: 'real-madrid', description: 'Hala Madrid! Cộng đồng fan Real Madrid.', logo: '👑', coverColor: 'from-purple-900 to-blue-900', cover: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=800&auto=format&fit=crop', members: '71.5K', posts: '203', category: 'team', isJoined: true },
  { name: 'FC Barcelona', slug: 'barcelona', description: 'Més que un club! Nơi hội tụ của Blaugrana fans.', logo: '💎', coverColor: 'from-blue-900 to-indigo-900', cover: 'https://images.unsplash.com/photo-1553778263-733ebc31eb2a?q=80&w=800&auto=format&fit=crop', members: '68.9K', posts: '187', category: 'team', isJoined: false },
];

const USER_PROFILE = {
  username: 'HoangOcean',
  email: 'hoang@example.com',
  displayName: 'Hoàng Ocean',
  initials: 'HO',
  role: 'ADMIN',
  level: 18,
  levelName: '🌟 Super Fan',
  levelTitle: '🌟 Super Fan',
  tier: 'PLUS',
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
  ],
  recentActivity: [
    { id: 'act1', type: 'prediction', title: 'Dự đoán đúng!', detail: 'Man Utd 2 - 1 Arsenal', time: '2 giờ trước', xp: 50 },
    { id: 'act2', type: 'match_watched', title: 'Đã xem trận đấu', detail: 'Real Madrid vs Bayern Munich (UCL)', time: '1 ngày trước', xp: 10 },
  ],
  journal: [
    { date: '09/06', matches: ['Man Utd vs Arsenal'], predictions: 1, posts: 0 },
    { date: '08/06', matches: ['UCL: Real Madrid vs Bayern'], predictions: 2, posts: 1 },
  ],
  joinedCommunities: ['Man United FC', 'Real Madrid CF', 'Fan MU Việt Nam'],
  communityEmojis: ['🔴', '👑', '🇻🇳'],
};

const TOP_PREDICTORS = [
  { username: 'oracle_football', displayName: 'Oracle Football', avatarColor: 'bg-emerald-600', initials: 'OF', level: 30, levelTitle: 'Tiên Tri', accuracy: 87.4, points: 12840, streak: 12, rank: 1, tier: 'REGULAR' },
  { username: 'stats_master_vn', displayName: 'Stats Master VN', avatarColor: 'bg-violet-600', initials: 'SM', level: 28, levelTitle: 'Phù Thuỷ', accuracy: 84.1, points: 11230, streak: 8, rank: 2, tier: 'REGULAR' },
  { username: 'football_wizard', displayName: 'Football Wizard', avatarColor: 'bg-amber-600', initials: 'FW', level: 25, levelTitle: 'Chuyên Gia', accuracy: 81.7, points: 9870, streak: 5, rank: 3, tier: 'REGULAR' }
];

const COMPETITIONS = [
  { name: 'FIFA World Cup 2026', shortName: 'World Cup', logo: '🏆', country: 'International', season: '2026', teamsCount: 48, followers: '100M', color: 'from-amber-500 to-yellow-700' },
  { name: 'Premier League', shortName: 'PL', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', season: '2025/26', teamsCount: 20, followers: '12.5M', color: 'from-purple-600 to-fuchsia-600' },
  { name: 'UEFA Champions League', shortName: 'UCL', logo: '⭐', country: 'Europe', season: '2025/26', teamsCount: 36, followers: '25.4M', color: 'from-blue-600 to-indigo-800' },
  { name: 'La Liga', shortName: 'LaLiga', logo: '🇪🇸', country: 'Spain', season: '2025/26', teamsCount: 20, followers: '8.2M', color: 'from-orange-500 to-red-600' },
  { name: 'Bundesliga', shortName: 'BL', logo: '🇩🇪', country: 'Germany', season: '2025/26', teamsCount: 18, followers: '4.8M', color: 'from-red-600 to-rose-800' },
  { name: 'Serie A', shortName: 'SA', logo: '🇮🇹', country: 'Italy', season: '2025/26', teamsCount: 20, followers: '5.1M', color: 'from-green-500 to-emerald-700' },
  { name: 'Ligue 1', shortName: 'L1', logo: '🇫🇷', country: 'France', season: '2025/26', teamsCount: 18, followers: '3.9M', color: 'from-blue-400 to-cyan-600' },
  { name: 'V.League 1', shortName: 'VL1', logo: '🇻🇳', country: 'Vietnam', season: '2025/26', teamsCount: 14, followers: '1.2M', color: 'from-red-500 to-red-700' },
];

const PRED_MATCHES = [
  { homeTeam: 'Man United', awayTeam: 'Tottenham', homeEmoji: '🔴', awayEmoji: '⚪', competition: 'Premier League', kickoff: 'T7, 14/06 · 21:00', xpReward: 50 },
  { homeTeam: 'Real Madrid', awayTeam: 'Liverpool', homeEmoji: '👑', awayEmoji: '🦅', competition: 'UEFA Champions League', kickoff: 'T4, 11/06 · 02:00', xpReward: 100 },
  { homeTeam: 'Barcelona', awayTeam: 'Atlético Madrid', homeEmoji: '💎', awayEmoji: '🔵', competition: 'La Liga', kickoff: 'CN, 15/06 · 22:00', xpReward: 50 },
  { homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', homeEmoji: '🦁', awayEmoji: '💛', competition: 'Bundesliga', kickoff: 'T7, 14/06 · 23:30', xpReward: 50 },
  { homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeEmoji: '⚡', awayEmoji: '💙', competition: 'Premier League', kickoff: 'CN, 15/06 · 19:30', xpReward: 50 },
  { homeTeam: 'PSG', awayTeam: 'Inter Milan', homeEmoji: '🗼', awayEmoji: '🖤', competition: 'UEFA Champions League', kickoff: 'T4, 11/06 · 02:00', xpReward: 100 },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;
  if (!db) {
      throw new Error('Database connection failed');
  }

  console.log('Clearing old data...');
  await db.collection('matches').deleteMany({});
  await db.collection('posts').deleteMany({});
  await db.collection('communities').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('competitions').deleteMany({});
  await db.collection('predictionmatches').deleteMany({});

  console.log('Inserting mock data...');
  await db.collection('matches').insertMany([...LIVE_MATCHES, ...UPCOMING_MATCHES, ...FINISHED_MATCHES]);
  await db.collection('posts').insertMany(TRENDING_POSTS);
  await db.collection('communities').insertMany(TOP_COMMUNITIES);
  await db.collection('users').insertMany([USER_PROFILE, ...TOP_PREDICTORS]);
  await db.collection('competitions').insertMany(COMPETITIONS);
  await db.collection('predictionmatches').insertMany(PRED_MATCHES);

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch(console.error);
