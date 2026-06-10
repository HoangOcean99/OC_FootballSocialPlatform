export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  favoriteTeams: string[];
  favoriteCompetitions: string[];
  level: string; // e.g., 'Rookie Fan', 'Legend Fan'
  xp: number;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logoUrl: string;
  country: string;
}

export interface Competition {
  id: string;
  name: string;
  logoUrl: string;
  type: 'league' | 'cup';
}

export interface Match {
  id: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  startTime: Date;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
}
