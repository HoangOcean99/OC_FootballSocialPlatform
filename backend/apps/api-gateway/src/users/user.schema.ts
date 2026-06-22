import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserProfile as IUserProfile } from '@football-fan/shared-types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User implements Omit<IUserProfile, 'id'> {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: 'USER' })
  role: 'USER' | 'ADMIN';

  @Prop()
  displayName?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  avatarColor?: string;

  @Prop()
  initials?: string;

  @Prop({ type: [String], default: [] })
  favoriteTeams: string[];

  @Prop({ type: [String], default: [] })
  favoriteClubs: string[];

  @Prop({ type: [String], default: [] })
  favoriteNationalTeams: string[];

  @Prop({ type: [String], default: [] })
  favoriteCompetitions: string[];

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 'Thành viên mới' })
  levelTitle: string;

  @Prop({ default: 500 })
  xp: number;

  @Prop({ default: 0 })
  extraPredictions: number;

  @Prop({ default: 0 })
  dailyPredictionsCount: number;

  @Prop({ default: '' })
  lastPredictionDate: string;

  @Prop({ type: [String], default: [] })
  purchasedItems: string[];

  @Prop({ type: [String], default: [] })
  activeItems: string[];

  @Prop({ default: () => new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) })
  joinDate: string;

  @Prop({ default: 'Tân binh' })
  levelName: string;

  @Prop({ default: 1000 })
  xpToNextLevel: number;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: Object, default: { posts: 0, comments: 0, correctPredictions: 0, matchesWatched: 0 } })
  stats: {
    posts: number;
    comments: number;
    correctPredictions: number;
    matchesWatched: number;
  };

  @Prop({ type: Object, default: { total: 0, correct: 0, accuracy: 0, streak: 0, bestStreak: 0, xpEarned: 0 } })
  predictionStats: {
    total: number;
    correct: number;
    accuracy: number;
    streak: number;
    bestStreak: number;
    xpEarned: number;
  };

  @Prop({ type: [Object], default: [] })
  achievements: any[];

  @Prop({ type: [Object], default: [] })
  recentActivity: any[];

  @Prop({ type: [Object], default: [] })
  journal: any[];

  @Prop({ type: [String], default: [] })
  joinedCommunities: string[];

  @Prop({ type: [String], default: [] })
  communityInvites: string[];

  @Prop({ type: [String], default: [] })
  adminInvites: string[];

  @Prop({ type: [String], default: [] })
  communityEmojis: string[];

  // Keep fields for Predictor
  @Prop({ default: 0 })
  accuracy: number;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  rank: number;

  @Prop({ default: 'REGULAR' })
  tier: string;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
