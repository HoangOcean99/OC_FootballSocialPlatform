import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: null })
  passwordHash: string;

  @Prop({ default: 'USER' })
  role: 'USER' | 'ADMIN';

  @Prop({ default: AuthProvider.LOCAL })
  provider: string;

  @Prop({ default: null })
  googleId: string;

  @Prop({ default: '' })
  avatarUrl: string;

  // Football profile
  @Prop({ type: [String], default: [] })
  favoriteClubs: string[]; // VD: ['Manchester United', 'Barcelona']

  @Prop({ type: [String], default: [] })
  favoriteNationalTeams: string[]; // VD: ['Argentina', 'Vietnam']

  // Onboarding
  @Prop({ default: false })
  onboardingCompleted: boolean;

  // Gamification
  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 'REGULAR' })
  tier: string;

  @Prop({ default: 'Chuyên gia dự đoán' }) // Default levelTitle
  levelTitle: string;

  @Prop({ default: 'Người mới' }) // Default levelName
  levelName: string;

  @Prop({ default: 1000 })
  xpToNextLevel: number;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: Object, default: { posts: 0, comments: 0, correctPredictions: 0, matchesWatched: 0 } })
  stats: { posts: number; comments: number; correctPredictions: number; matchesWatched: number };

  @Prop({ type: Object, default: { total: 0, correct: 0, accuracy: 0, streak: 0, bestStreak: 0, xpEarned: 0 } })
  predictionStats: { total: number; correct: number; accuracy: number; streak: number; bestStreak: number; xpEarned: number };

  @Prop({ type: [Object], default: [] })
  achievements: any[];

  @Prop({ type: [Object], default: [] })
  recentActivity: any[];

  @Prop({ type: [Object], default: [] })
  journal: any[];

  @Prop({ type: [String], default: [] })
  joinedCommunities: string[];

  @Prop({ type: [String], default: [] })
  communityEmojis: string[];

  @Prop({ type: Date, default: Date.now })
  lastActiveAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
