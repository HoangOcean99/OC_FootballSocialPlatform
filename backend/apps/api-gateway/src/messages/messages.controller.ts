import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.sub);
  }

  @Get('conversations/:targetUserId')
  async getMessages(@Request() req: any, @Param('targetUserId') targetUserId: string) {
    return this.messagesService.getMessages(req.user.sub, targetUserId);
  }

  @Post('conversations/:targetUserId')
  async sendMessage(
    @Request() req: any,
    @Param('targetUserId') targetUserId: string,
    @Body('content') content: string,
    @Body('imageUrl') imageUrl?: string,
  ) {
    return this.messagesService.sendMessage(req.user.sub, targetUserId, content, imageUrl);
  }

  @Put('conversations/:conversationId/read')
  async markAsRead(@Request() req: any, @Param('conversationId') conversationId: string) {
    return this.messagesService.markAsRead(req.user.sub, conversationId);
  }
}
