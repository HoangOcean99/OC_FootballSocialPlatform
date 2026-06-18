import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './post.schema';
import { Comment, CommentSchema } from './comment.schema';
import { CommunitiesModule } from '../communities/communities.module';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
    forwardRef(() => CommunitiesModule),
    forwardRef(() => UsersModule),
    UploadModule,
    WebsocketsModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService]
})
export class PostsModule {}
