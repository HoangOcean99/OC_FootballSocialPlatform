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

  @Prop()
  creatorId: string;

  @Prop({ type: [String], default: [] })
  adminIds: string[];

  @Prop()
  slogan: string;

  @Prop()
  rules: string;

  @Prop([String])
  tags: string[];

  @Prop()
  foundedDate: Date;

  @Prop()
  location: string;

  @Prop({ type: Object })
  socialLinks: {
    facebook?: string;
    discord?: string;
    instagram?: string;
    youtube?: string;
  };

  @Prop()
  website: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ default: false })
  requireApproval: boolean;

  @Prop({ default: false })
  requirePostApproval: boolean;

  @Prop({ default: '#10b981' })
  themeColor: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  memberCount: number;

  @Prop({ default: 0 })
  postsToday: number;

  @Prop({ default: false })
  isJoined: boolean;

  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  coverColor: string;

  @Prop()
  cover?: string;

  @Prop()
  members?: number;

  @Prop()
  posts?: number;

  @Prop({ type: [String], default: [] })
  joinRequests: string[];
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
