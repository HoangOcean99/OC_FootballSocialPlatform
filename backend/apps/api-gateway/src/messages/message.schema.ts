import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: string;

  @Prop({ default: '' })
  content: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
