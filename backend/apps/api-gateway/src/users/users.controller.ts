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
  // @UseGuards(JwtAuthGuard)
  async getOnlineUsers(@Request() req: any) {
    const users = await this.usersService.getOnlineUsers(req?.user?.sub || '6a3b5f76318daf781609b724');
    return users.map((u) => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Query('q') query: string) {
    const users = await this.usersService.searchUsers(query);
    return users.map((u) => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('profile/:username')
  // @UseGuards(JwtAuthGuard)
  async getProfile(@Param('username') username: string, @Request() req: any) {
    console.log('Fetching profile for username:', username);
    const user = await this.usersService.getProfile(username);
    console.log('Found user:', !!user);
    if (!user) return null;

    const isOwnProfile = user._id.toString() === req?.user?.sub || user.username === req?.user?.username;
    const userObj = user.toObject();

    if (!isOwnProfile) {
      delete (userObj as any).email;
      // Do not delete purchasedItems or activeItems, as they are used to display cosmetics on the profile.
      delete (userObj as any).passwordHash;
      delete (userObj as any).googleId;
      delete (userObj as any).provider;
    }

    return { id: user._id.toString(), ...userObj, _id: undefined, __v: undefined };
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

  // Follow System
  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Request() req: any, @Param('id') targetId: string) {
    return this.usersService.followUser(req.user.sub, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Request() req: any, @Param('id') targetId: string) {
    return this.usersService.unfollowUser(req.user.sub, targetId);
  }

  @Get('me/followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(@Request() req: any) {
    return this.usersService.getFollowers(req.user.sub);
  }

  @Get('me/following')
  @UseGuards(JwtAuthGuard)
  async getFollowing(@Request() req: any) {
    return this.usersService.getFollowing(req.user.sub);
  }

  @Get('me/suggestions')
  @UseGuards(JwtAuthGuard)
  async getSuggestions(@Request() req: any) {
    return this.usersService.getSuggestedUsers(req.user.sub);
  }
}
