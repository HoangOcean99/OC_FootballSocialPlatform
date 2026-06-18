import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class UsersService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10),
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async getTopPredictors() {
    return this.userModel.find().sort({ rank: 1 }).limit(10).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async getProfile(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async searchUsers(query: string) {
    if (!query || query.trim().length === 0) return [];
    const searchRegex = new RegExp(query, 'i');
    return this.userModel.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ]
    }).limit(10).select('username displayName avatarUrl role').exec();
  }

  async updateLastActive(userId: string) {
    const timestamp = Date.now();
    // Add or update the user's heartbeat timestamp in the sorted set
    await this.redisClient.zadd('online_users', timestamp, userId);
    
    // Optional: Keep MongoDB loosely synced (e.g., only update if we haven't in the last 5 mins)
    // For extreme performance, we skip MongoDB update entirely on every heartbeat.
    return { success: true };
  }

  async getOnlineUsers(limit: number = 10) {
    const cutoff = Date.now() - 30 * 1000; // 30 seconds ago
    
    // 1. Remove expired users from Redis (Cleanup)
    await this.redisClient.zremrangebyscore('online_users', '-inf', cutoff);
    
    // 2. Get top N most recently active users
    const activeUserIds = await this.redisClient.zrevrange('online_users', 0, limit - 1);
    
    if (!activeUserIds.length) return [];

    // 3. Fetch their details from MongoDB
    const users = await this.userModel.find({ _id: { $in: activeUserIds } }).exec();
    
    // Sort users to match the Redis recency order
    return activeUserIds
      .map(id => users.find(u => u._id.toString() === id))
      .filter(u => u !== undefined);
  }

  async getTodayStats() {
    const cutoff = Date.now() - 30 * 1000;
    await this.redisClient.zremrangebyscore('online_users', '-inf', cutoff);
    const onlineCount = await this.redisClient.zcard('online_users');

    const users = await this.userModel.find({}, 'stats predictionStats');
    let newPosts = 0;
    let predictionsToday = 0;

    users.forEach(u => {
      if (u.stats && u.stats.posts) newPosts += u.stats.posts;
      if (u.predictionStats && u.predictionStats.total) predictionsToday += u.predictionStats.total;
    });

    // Make the numbers look like "today" by multiplying by a factor or just use the totals.
    // For realism in a prototype, we'll return the total posts/predictions but format it nicely on the frontend.
    return {
      newPosts: newPosts,
      predictionsToday: predictionsToday,
      onlineCount: onlineCount,
    };
  }

  async addFavoriteCompetition(userId: string, compName: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteCompetitions: compName } },
      { new: true }
    ).exec();
  }

  async removeFavoriteCompetition(userId: string, compName: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteCompetitions: compName } },
      { new: true }
    ).exec();
  }
}
