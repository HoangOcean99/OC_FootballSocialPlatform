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
}

export interface PostAuthor {
  username: string;
  displayName: string;
  avatarColor: string;
  initials: string;
  level: number;
  levelTitle: string;
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
  timeAgo: string;
  tags: string[];
  isLiked: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  memberCount: number;
  postsToday: number;
  category: string;
  isJoined: boolean;
  coverColor: string;
  cover?: string;
  members?: string;
  posts?: string;
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
}

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
