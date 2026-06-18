import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Post as IPost, PostAuthor, PostCommunity } from '@football-fan/shared-types';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post implements Omit<IPost, 'id'> {
  @Prop({ type: Object, required: true })
  author: PostAuthor;

  @Prop({ type: Object, required: true })
  community: PostCommunity;

  @Prop({ required: true })
  content: string;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop([String])
  tags: string[];

  @Prop({ default: false })
  isLiked: boolean;

  // Map of userId -> reactionType
  @Prop({ type: Map, of: String, default: {} })
  reactions: Map<string, string>;

  @Prop({ default: 'APPROVED' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
