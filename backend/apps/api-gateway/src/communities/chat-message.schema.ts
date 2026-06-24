import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, index: true })
  communityId: string;

  @Prop({ type: Object, required: true })
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    purchasedItems?: string[];
  };

  @Prop()
  content?: string;

  @Prop()
  imageUrl?: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
