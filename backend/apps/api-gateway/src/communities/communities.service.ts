import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Community, CommunityDocument } from './community.schema';

@Injectable()
export class CommunitiesService {
  constructor(@InjectModel(Community.name) private communityModel: Model<CommunityDocument>) {}

  async getTopCommunities() {
    return this.communityModel.find().sort({ memberCount: -1 }).limit(4).exec();
  }

  async getAllCommunities() {
    return this.communityModel.find().exec();
  }
}
