import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserBet as IUserBet } from '@football-fan/shared-types';

export type UserBetDocument = UserBet & Document;

@Schema({ timestamps: true })
export class UserBet implements Omit<IUserBet, 'id'> {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  matchId: string;

  @Prop({ required: true })
  type: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE';

  @Prop({ required: true })
  wager: number;

  @Prop({ required: true })
  odds: number;

  @Prop({ required: true, default: 'PENDING' })
  status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

  @Prop()
  predictedScore?: string;
}

export const UserBetSchema = SchemaFactory.createForClass(UserBet);
