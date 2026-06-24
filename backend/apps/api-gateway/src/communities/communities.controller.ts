import { Controller, Get, Param, Post, Body, UseGuards, Request, Delete, Put, Query } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get('top')
  async getTopCommunities() {
    const communities = await this.communitiesService.getTopCommunities();
    return communities.map((c) => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  @Get()
  async getAllCommunities() {
    const communities = await this.communitiesService.getAllCommunities();
    return communities.map((c) => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('check-name')
  async checkName(@Query('name') name: string) {
    if (!name) return { isAvailable: false };
    const isAvailable = await this.communitiesService.checkNameAvailable(name);
    return { isAvailable };
  }

  @Get('me/invites')
  @UseGuards(JwtAuthGuard)
  async getMyInvites(@Request() req: any) {
    return this.communitiesService.getMyInvites(req.user.sub);
  }

  @Get(':id')
  async getCommunityById(@Param('id') id: string) {
    const c = await this.communitiesService.getCommunityById(id);
    return { id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCommunity(@Request() req: any, @Body() data: any) {
    const c = await this.communitiesService.createCommunity(data, req.user.sub);
    // automatically make creator join
    await this.communitiesService.joinCommunity(req.user.sub, c._id.toString());
    return { id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined };
  }

  @Post('batch-delete')
  @UseGuards(JwtAuthGuard)
  async batchDeleteCommunities(@Request() req: any, @Body() data: { ids: string[] }) {
    await this.communitiesService.batchDeleteCommunities(data.ids, req.user.sub);
    return { success: true };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCommunity(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const c = await this.communitiesService.updateCommunity(id, req.user.sub, data);
    return { id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCommunity(@Request() req: any, @Param('id') id: string) {
    await this.communitiesService.deleteCommunity(id, req.user.sub);
    return { success: true };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinCommunity(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.joinCommunity(req.user.sub, id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveCommunity(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.leaveCommunity(req.user.sub, id);
  }

  @Get(':id/requests')
  @UseGuards(JwtAuthGuard)
  async getJoinRequests(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.getJoinRequests(id, req.user.sub);
  }

  @Post(':id/requests/:userId/approve')
  @UseGuards(JwtAuthGuard)
  async approveJoinRequest(@Request() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.communitiesService.approveJoinRequest(id, req.user.sub, userId);
  }

  @Post(':id/requests/:userId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectJoinRequest(@Request() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.communitiesService.rejectJoinRequest(id, req.user.sub, userId);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async getMembers(@Param('id') id: string) {
    return this.communitiesService.getMembers(id);
  }

  @Post(':id/members/:userId/kick')
  @UseGuards(JwtAuthGuard)
  async kickMember(@Request() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.communitiesService.kickMember(id, req.user.sub, userId);
  }

  @Post(':id/members/invite')
  @UseGuards(JwtAuthGuard)
  async inviteMember(@Request() req: any, @Param('id') id: string, @Body('username') username: string) {
    return this.communitiesService.inviteMember(id, req.user.sub, username);
  }

  @Post(':id/invites/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvite(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.acceptInvite(id, req.user.sub);
  }

  @Post(':id/invites/reject')
  @UseGuards(JwtAuthGuard)
  async rejectInvite(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.rejectInvite(id, req.user.sub);
  }

  @Post(':id/admins/promote')
  @UseGuards(JwtAuthGuard)
  async promoteAdmin(@Request() req: any, @Param('id') id: string, @Body('userId') targetUserId: string) {
    return this.communitiesService.promoteAdmin(id, req.user.sub, targetUserId);
  }

  @Get('me/admin-invites')
  @UseGuards(JwtAuthGuard)
  async getMyAdminInvites(@Request() req: any) {
    return this.communitiesService.getMyAdminInvites(req.user.sub);
  }

  @Post(':id/admins/accept')
  @UseGuards(JwtAuthGuard)
  async acceptAdminInvite(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.acceptAdminInvite(id, req.user.sub);
  }

  @Post(':id/admins/reject')
  @UseGuards(JwtAuthGuard)
  async rejectAdminInvite(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.rejectAdminInvite(id, req.user.sub);
  }

  @Post(':id/admins/resign')
  @UseGuards(JwtAuthGuard)
  async resignAdmin(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.resignAdmin(id, req.user.sub);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getCommunityMessages(@Param('id') id: string, @Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : 50;
    return this.communitiesService.getCommunityMessages(id, l);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async sendCommunityMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('imageUrl') imageUrl?: string,
  ) {
    const message = await this.communitiesService.saveChatMessage(id, req.user.sub, content, imageUrl);
    // Note: EventsGateway should be injected into CommunitiesController if not using service.
    // Wait, let's just let the CommunitiesController use EventsGateway?
    // Let me check if EventsGateway is injected. It's not.
    // I should inject it in the controller, or better, the service.
    return message;
  }
}
