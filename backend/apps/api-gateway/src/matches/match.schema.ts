import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Match as IMatch, Team } from '@football-fan/shared-types';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match implements Omit<IMatch, 'id'> {
  @Prop({ type: Object, required: true })
  homeTeam: Team;

  @Prop({ type: Object, required: true })
  awayTeam: Team;

  @Prop()
  homeScore?: number;

  @Prop()
  awayScore?: number;

  @Prop()
  minute?: number;

  @Prop({ required: true })
  kickoff: string;

  @Prop({ required: true })
  competition: string;

  @Prop({ required: true })
  competitionLogo: string;

  @Prop()
  stadium?: string;

  @Prop()
  round?: string;

  @Prop({ required: true, enum: ['SCHEDULED', 'LIVE', 'HT', 'FINISHED', 'POSTPONED'] })
  status: 'SCHEDULED' | 'LIVE' | 'HT' | 'FINISHED' | 'POSTPONED';
}

export const MatchSchema = SchemaFactory.createForClass(Match);
