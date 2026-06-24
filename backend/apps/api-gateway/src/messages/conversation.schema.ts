import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: string[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: string;

  @Prop({ type: Object, default: {} })
  unreadCount: Record<string, number>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
