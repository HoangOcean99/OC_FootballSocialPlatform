import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Community as ICommunity } from '@football-fan/shared-types';

export type CommunityDocument = Community & Document;

@Schema({ timestamps: true })
export class Community implements Omit<ICommunity, 'id'> {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ default: 0 })
  memberCount: number;

  @Prop({ default: 0 })
  postsToday: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  isJoined: boolean;

  @Prop({ required: true })
  coverColor: string;

  @Prop()
  cover?: string;

  @Prop()
  members?: string;

  @Prop()
  posts?: string;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
