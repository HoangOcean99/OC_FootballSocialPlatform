export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  displayName?: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
  favoriteTeams: string[];
  favoriteCompetitions: string[];
  favoriteClubs?: string[];
  favoriteNationalTeams?: string[];
  level: number;
  levelTitle: string;
  tier?: string;
  xp: number;
  predictionStats?: {
    total?: number;
    correct: number;
    wrong?: number;
    accuracy: number;
    streak: number;
    bestStreak?: number;
    xpEarned?: number;
  };
  extraPredictions?: number;
  dailyPredictionsCount?: number;
  lastPredictionDate?: string;
  purchasedItems?: string[];
  activeItems?: string[];
}

export interface Team {
  id?: string;
  name: string;
  shortName: string;
  logo: string; // emoji or URL
  color: string;
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  season: string;
  teamsCount: number;
  followers?: string;
  color?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  kickoff: string;
  competition: string;
  competitionLogo: string;
  stadium?: string;
  round?: string;
  status: 'SCHEDULED' | 'LIVE' | 'HT' | 'FINISHED' | 'POSTPONED';
  note?: string;
}

export interface PostAuthor {
  username: string;
  displayName: string;
  avatarColor: string;
  initials: string;
  level: number;
  levelTitle: string;
  purchasedItems?: string[];
}

export interface PostCommunity {
  name: string;
  slug: string;
  emoji: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  community: PostCommunity;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isLiked: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  // Computed reaction fields (not stored directly)
  reactionCounts?: Record<string, number>;
  myReaction?: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  author: PostAuthor;
  content: string;
  image?: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string; // For nested replies
  createdAt: Date;
  replies?: Comment[]; // For frontend tree structure
}

export interface Community {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logo: string; // Emoji or ImgBB URL
  coverColor: string;
  cover?: string; // ImgBB URL
  category: string;
  members?: number;
  memberCount?: number;
  posts?: number;
  postsToday?: number;
  isJoined?: boolean;
  creatorId?: string;
  adminIds?: string[];
  
  // New Fields
  slogan?: string;
  rules?: string;
  tags?: string[];
  foundedDate?: Date;
  location?: string;
  socialLinks?: {
    facebook?: string;
    discord?: string;
    instagram?: string;
    youtube?: string;
  };
  website?: string;
  isPrivate?: boolean;
  requireApproval?: boolean;
  requirePostApproval?: boolean;
  joinRequests?: string[];
  themeColor?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserActivity {
  id: string;
  type: 'prediction' | 'match_watched' | 'post' | 'joined_community' | 'achievement';
  title: string;
  detail: string;
  time: string;
  xp?: number;
}

export interface UserProfile extends User {
  joinDate: string;
  levelName: string;
  xpToNextLevel: number;
  isBanned?: boolean;

  stats: {
    posts: number;
    comments: number;
    correctPredictions: number;
    matchesWatched: number;
  };
  predictionStats: {
    total: number;
    correct: number;
    accuracy: number;
    streak: number;
    bestStreak: number;
    xpEarned: number;
  };
  achievements: Achievement[];
  recentActivity: UserActivity[];
  journal: {
    date: string;
    matches: string[];
    predictions: number;
    posts: number;
  }[];
  joinedCommunities: string[];
  communityEmojis: string[];
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
  purchasedItems?: string[];
}

export interface PredMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeEmoji: string;
  awayEmoji: string;
  homeLogo?: string;
  awayLogo?: string;
  competition: string;
  kickoff: string;
  xpReward: number; // Max possible or base reward
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  homeScore?: number;
  awayScore?: number;
  status?: 'OPEN' | 'CLOSED' | 'LIVE' | 'FINISHED' | 'RESOLVED';
}

export interface UserBet {
  id: string;
  userId: string;
  matchId: string;
  type: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE';
  wager: number;
  odds: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
  predictedScore?: string; // e.g. "2-1"
  createdAt?: string;
}

export interface StandingEntry {
  rank: number;
  team: {
    id: string;
    name: string;
    shortName?: string;
    logo: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: string;
  points: number;
  form?: string;
  description?: string;
}
