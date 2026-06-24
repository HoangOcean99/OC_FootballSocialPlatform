import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { Community, CommunitySchema } from './community.schema';
import { ChatMessage, ChatMessageSchema } from './chat-message.schema';

import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    UsersModule,
    UploadModule,
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
