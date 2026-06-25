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
      password: this.configService.get<string>('REDIS_PASSWORD'),
      tls: this.configService.get<string>('REDIS_PASSWORD') ? { servername: this.configService.get<string>('REDIS_HOST') } : undefined,
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async getTopPredictors() {
    return this.userModel.find().sort({ 'predictionStats.correct': -1, xp: -1 }).limit(10).select('username displayName avatarUrl avatarColor initials xp predictionStats').exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findUsersByIds(ids: string[]) {
    return this.userModel.find({ _id: { $in: ids } }).select('username displayName avatarUrl avatarColor initials purchasedItems').exec();
  }

  async getProfile(usernameOrId: string) {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
      const user = await this.userModel.findById(usernameOrId).exec();
      if (user) return user;
    }
    return this.userModel.findOne({ username: usernameOrId }).exec();
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

  async getOnlineUsers(userId: string, limit: number = 10) {
    const cutoff = Date.now() - 30 * 1000; // 30 seconds ago
    
    // 1. Remove expired users from Redis (Cleanup)
    await this.redisClient.zremrangebyscore('online_users', '-inf', cutoff);
    
    // 2. Get top active users (get more to filter locally)
    const activeUserIds = await this.redisClient.zrevrange('online_users', 0, 100);
    
    if (!activeUserIds.length) return [];

    // 3. Fetch current user to get mutual friends
    const currentUser = await this.userModel.findById(userId).exec();
    if (!currentUser) return [];

    // A mutual friend is someone who is in both following and followers
    const mutualFriends = (currentUser.following || []).filter(id => 
      (currentUser.followers || []).includes(id)
    );

    // 4. Filter active users by mutual friends
    const onlineMutualFriendsIds = activeUserIds.filter(id => mutualFriends.includes(id)).slice(0, limit);

    if (!onlineMutualFriendsIds.length) return [];

    // 5. Fetch their details from MongoDB
    const users = await this.userModel.find({ _id: { $in: onlineMutualFriendsIds } }).exec();
    
    // Sort users to match the Redis recency order
    return onlineMutualFriendsIds
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

  // Follow System
  async followUser(userId: string, targetId: string) {
    if (userId === targetId) throw new Error('Cannot follow yourself');
    
    // Add targetId to userId's following
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { following: targetId }
    });

    // Add userId to targetId's followers
    await this.userModel.findByIdAndUpdate(targetId, {
      $addToSet: { followers: userId }
    });

    return { success: true };
  }

  async unfollowUser(userId: string, targetId: string) {
    // Remove targetId from userId's following
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { following: targetId }
    });

    // Remove userId from targetId's followers
    await this.userModel.findByIdAndUpdate(targetId, {
      $pull: { followers: userId }
    });

    return { success: true };
  }

  async getFollowers(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.followers || user.followers.length === 0) return [];

    const followers = await this.userModel.find({ _id: { $in: user.followers } }).exec();
    return followers.map(u => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined, passwordHash: undefined }));
  }

  async getFollowing(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.following || user.following.length === 0) return [];

    const following = await this.userModel.find({ _id: { $in: user.following } }).exec();
    return following.map(u => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined, passwordHash: undefined }));
  }

  async getSuggestedUsers(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    const following = user?.following || [];

    // Find users not in the following list and not the current user, limit to 20
    const suggestions = await this.userModel.find({
      _id: { $nin: [...following, userId] }
    }).limit(20).exec();

    return suggestions.map(u => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined, passwordHash: undefined }));
  }
}
