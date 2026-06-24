import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Comment as IComment, PostAuthor } from '@football-fan/shared-types';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment implements Omit<IComment, 'id' | 'createdAt' | 'replies'> {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: string;

  @Prop({ type: Object, required: true })
  author: PostAuthor;

  @Prop({ default: '' })
  content: string;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  parentId?: string;

  @Prop({ default: false })
  isLiked?: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
