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
  @Prop({ default: 'Rookie Fan' })
  level: string;

  @Prop({ default: 0 })
  xp: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
