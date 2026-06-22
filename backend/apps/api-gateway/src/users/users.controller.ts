import { Controller, Get, Param, Put, Post, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('top-predictors')
  async getTopPredictors() {
    const users = await this.usersService.getTopPredictors();
    return users.map((u) => {
      const obj = u.toObject();
      return { 
        id: u._id.toString(), 
        username: obj.username,
        displayName: obj.displayName || obj.username || 'Người dùng',
        avatarUrl: obj.avatarUrl,
        avatarColor: obj.avatarColor,
        initials: obj.initials,
        points: obj.predictionStats?.correct || 0,
        accuracy: obj.predictionStats?.accuracy || 0,
        streak: obj.predictionStats?.streak || 0,
        xp: obj.xp || 0,
        rank: 0,
      };
    });
  }

  @Get('stats/today')
  async getTodayStats() {
    return this.usersService.getTodayStats();
  }

  @Get('online')
  async getOnlineUsers() {
    const users = await this.usersService.getOnlineUsers();
    return users.map((u) => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Query('q') query: string) {
    const users = await this.usersService.searchUsers(query);
    return users.map((u) => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    const user = await this.usersService.getProfile(username);
    if (!user) return null;
    return { id: user._id.toString(), ...user.toObject(), _id: undefined, __v: undefined };
  }

  @Put('heartbeat')
  @UseGuards(JwtAuthGuard)
  async updateHeartbeat(@Request() req: any) {
    await this.usersService.updateLastActive(req.user.sub);
    return { success: true };
  }

  @Post('me/favorites/competitions/:name')
  @UseGuards(JwtAuthGuard)
  async addFavoriteCompetition(@Request() req: any, @Param('name') name: string) {
    const user = await this.usersService.addFavoriteCompetition(req.user.sub, name);
    return { success: true, favoriteCompetitions: user?.favoriteCompetitions || [] };
  }

  @Delete('me/favorites/competitions/:name')
  @UseGuards(JwtAuthGuard)
  async removeFavoriteCompetition(@Request() req: any, @Param('name') name: string) {
    const user = await this.usersService.removeFavoriteCompetition(req.user.sub, name);
    return { success: true, favoriteCompetitions: user?.favoriteCompetitions || [] };
  }
}
