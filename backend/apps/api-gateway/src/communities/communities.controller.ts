import { Controller, Get } from '@nestjs/common';
import { CommunitiesService } from './communities.service';

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
}
