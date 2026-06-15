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

  @Prop({ required: true })
  competition: string;

  @Prop({ required: true })
  kickoff: string;

  @Prop({ required: true })
  xpReward: number;
}

export const PredictionMatchSchema = SchemaFactory.createForClass(PredictionMatch);
