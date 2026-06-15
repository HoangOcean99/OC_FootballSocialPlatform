import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const plusUsers = await this.userModel.countDocuments({ tier: 'PLUS' });
    const adminUsers = await this.userModel.countDocuments({ role: 'ADMIN' });
    
    // Total posts & predictions could be fetched from their respective models,
    // but for now we'll sum them from user stats.
    const users = await this.userModel.find({}, 'stats predictionStats');
    let totalPosts = 0;
    let totalPredictions = 0;
    
    users.forEach(u => {
      if (u.stats && u.stats.posts) totalPosts += u.stats.posts;
      if (u.predictionStats && u.predictionStats.total) totalPredictions += u.predictionStats.total;
    });

    return {
      totalUsers,
      plusUsers,
      adminUsers,
      totalPosts,
      totalPredictions,
      revenue: plusUsers * 49000 // mock revenue
    };
  }

  async getUsers() {
    return this.userModel.find().sort({ createdAt: -1 }).select('-passwordHash -__v');
  }

  async updateUserTier(id: string, tier: 'REGULAR' | 'PLUS') {
    const user = await this.userModel.findByIdAndUpdate(id, { tier }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, role: 'USER' | 'ADMIN') {
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string, isBanned: boolean) {
    const user = await this.userModel.findByIdAndUpdate(id, { isBanned }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
