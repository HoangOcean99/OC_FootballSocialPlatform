import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PredMatch as IPredMatch } from '@football-fan/shared-types';

export type PredictionMatchDocument = PredictionMatch & Document;

@Schema({ timestamps: true })
export class PredictionMatch implements Omit<IPredMatch, 'id'> {
  @Prop({ required: true })
  homeTeam: string;

  @Prop({ required: true })
  awayTeam: string;

  @Prop({ required: true })
  homeEmoji: string;

  @Prop({ required: true })
  awayEmoji: string;

  @Prop()
  homeLogo?: string;

  @Prop()
  awayLogo?: string;

  @Prop({ required: true })
  competition: string;

  @Prop({ required: true })
  kickoff: string;

  @Prop({ required: true })
  xpReward: number;

  @Prop({ default: 2.0 })
  homeOdds: number;

  @Prop({ default: 3.5 })
  drawOdds: number;

  @Prop({ default: 2.5 })
  awayOdds: number;

  @Prop()
  homeScore?: number;

  @Prop()
  awayScore?: number;

  @Prop({ default: 'OPEN' })
  status: 'OPEN' | 'CLOSED' | 'LIVE' | 'FINISHED' | 'RESOLVED';
}

export const PredictionMatchSchema = SchemaFactory.createForClass(PredictionMatch);
