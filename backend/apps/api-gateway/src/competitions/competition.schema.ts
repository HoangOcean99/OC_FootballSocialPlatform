import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Competition as ICompetition } from '@football-fan/shared-types';

export type CompetitionDocument = Competition & Document;

@Schema({ timestamps: true })
export class Competition implements Omit<ICompetition, 'id'> {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  shortName: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  season: string;

  @Prop({ required: true })
  teamsCount: number;

  @Prop()
  followers?: string;

  @Prop()
  color?: string;
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);
