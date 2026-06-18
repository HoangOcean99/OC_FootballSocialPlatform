import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Community, CommunityDocument } from './community.schema';
import { User, UserDocument } from '../users/user.schema';
import { UploadService } from '../upload/upload.service';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly uploadService: UploadService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getTopCommunities() {
    return this.communityModel.find().sort({ memberCount: -1 }).limit(4).exec();
  }

  async getAllCommunities() {
    return this.communityModel.find().exec();
  }

  async getCommunityById(id: string) {
    // Try by MongoDB ObjectId first, fall back to slug lookup
    let community = null;
    if (/^[a-f\d]{24}$/i.test(id)) {
      community = await this.communityModel.findById(id).exec();
    }
    if (!community) {
      community = await this.communityModel.findOne({ slug: id }).exec();
    }
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async getCommunityBySlug(slug: string) {
    const community = await this.communityModel.findOne({ slug }).exec();
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async checkNameAvailable(name: string): Promise<boolean> {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.communityModel.findOne({
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { slug: baseSlug }
      ]
    }).exec();
    return !existing;
  }

  async createCommunity(data: any, creatorId: string) {
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    // Still use random suffix to be safe against concurrent creations, but checkNameAvailable handles UI logic
    const slug = baseSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : `community-${Date.now()}`;
    const newCommunity = new this.communityModel({
      ...data,
      slug,
      creatorId,
      memberCount: 0, // joinCommunity will increment this
    });
    return newCommunity.save();
  }

  async updateCommunity(id: string, userId: string, data: any) {
    const community = await this.communityModel.findById(id).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== userId) {
      throw new NotFoundException('You do not have permission to edit this community');
    }

    // Delete old images if they are changed
    if (data.logo && community.logo && data.logo !== community.logo) {
      const publicId = this.uploadService.extractPublicId(community.logo);
      if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
    }
    if (data.cover && community.cover && data.cover !== community.cover) {
      const publicId = this.uploadService.extractPublicId(community.cover);
      if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
    }

    Object.assign(community, data);
    return community.save();
  }

  async deleteCommunity(id: string, userId: string) {
    const community = await this.communityModel.findById(id).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== userId) {
      throw new NotFoundException('You do not have permission to delete this community');
    }

    if (community.logo) {
      const publicId = this.uploadService.extractPublicId(community.logo);
      if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
    }
    if (community.cover) {
      const publicId = this.uploadService.extractPublicId(community.cover);
      if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
    }

    return this.communityModel.findByIdAndDelete(id).exec();
  }

  async batchDeleteCommunities(ids: string[], userId: string) {
    // Find communities to be deleted to get their images
    const communitiesToDelete = await this.communityModel.find({
      _id: { $in: ids },
      $or: [{ creatorId: userId }, { adminIds: userId }]
    }).exec();

    // Delete images from Cloudinary
    for (const community of communitiesToDelete) {
      if (community.logo) {
        const publicId = this.uploadService.extractPublicId(community.logo);
        if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
      }
      if (community.cover) {
        const publicId = this.uploadService.extractPublicId(community.cover);
        if (publicId) await this.uploadService.deleteFile(publicId).catch(() => {});
      }
    }

    // Only delete communities where user is an admin
    return this.communityModel.deleteMany({
      _id: { $in: ids },
      $or: [{ creatorId: userId }, { adminIds: userId }]
    }).exec();
  }

  async joinCommunity(userId: string, communityId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');

    if (!user.joinedCommunities) {
      user.joinedCommunities = [];
    }

    if (!user.joinedCommunities.includes(communityId)) {
      if (community.requireApproval && community.creatorId !== userId) {
        if (!community.joinRequests) community.joinRequests = [];
        if (!community.joinRequests.includes(userId)) {
          community.joinRequests.push(userId);
          await community.save();
          
          this.eventsGateway.emitToUser(community.creatorId, 'COMMUNITY_JOIN_REQUESTED', {
            communityId: community._id.toString(),
            communityName: community.name,
            userId: user._id.toString(),
            username: user.username,
            avatarUrl: user.avatarUrl
          });
        }
        return { success: true, pending: true, joinedCommunities: user.joinedCommunities };
      } else {
        user.joinedCommunities.push(communityId);
        await user.save();

        community.memberCount = (community.memberCount || 0) + 1;
        await community.save();
        
        // Emit real-time event for joining
        this.eventsGateway.server.emit('COMMUNITY_MEMBER_JOINED', {
          communityId,
          userId: user._id.toString(),
          username: user.username,
          avatarUrl: user.avatarUrl
        });
      }
    }
    return { success: true, pending: false, joinedCommunities: user.joinedCommunities };
  }

  async leaveCommunity(userId: string, communityId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');

    if (!user.joinedCommunities) {
      user.joinedCommunities = [];
    }

    const allAdminIds = Array.from(new Set([community.creatorId, ...(community.adminIds || [])]));
    const isActuallyAdmin = allAdminIds.includes(userId);

    if (isActuallyAdmin) {
      if (allAdminIds.length <= 1) {
        if (community.memberCount > 1) {
          throw new Error('Bạn là Quản trị viên duy nhất. Hãy nhường quyền cho người khác trước khi rời đi.');
        } else {
          // Xóa luôn cộng đồng
          await this.batchDeleteCommunities([communityId], userId);
          user.joinedCommunities = user.joinedCommunities.filter((id) => id !== communityId);
          await user.save();
          return { success: true, pending: false, joinedCommunities: user.joinedCommunities, deleted: true };
        }
      } else {
        // Có nhiều admin, cho phép rời và xóa quyền admin
        if (community.adminIds && community.adminIds.includes(userId)) {
          community.adminIds = community.adminIds.filter(id => id !== userId);
        }
        if (community.creatorId === userId) {
          // Chuyển creatorId cho admin tiếp theo
          const nextAdmin = community.adminIds && community.adminIds[0];
          if (nextAdmin) {
            community.creatorId = nextAdmin;
          }
        }
        await community.save();
      }
    }

    let left = false;
    if (user.joinedCommunities.includes(communityId)) {
      user.joinedCommunities = user.joinedCommunities.filter((id) => id !== communityId);
      await user.save();

      community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
      await community.save();
      left = true;
    }

    if (community.joinRequests && community.joinRequests.includes(userId)) {
      community.joinRequests = community.joinRequests.filter((id) => id !== userId);
      await community.save();
    }

    if (left) {
      this.eventsGateway.server.emit('COMMUNITY_MEMBER_LEFT', {
        communityId,
        userId: user._id.toString()
      });
    }

    return { success: true, joinedCommunities: user.joinedCommunities, deleted: false };
  }

  async getJoinRequests(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== userId) throw new NotFoundException('Only admin can view requests');
    
    const requestIds = community.joinRequests || [];
    const users = await this.userModel.find({ _id: { $in: requestIds } }, 'username displayName avatarUrl initials').exec();
    return users.map(u => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  async approveJoinRequest(communityId: string, adminId: string, requesterId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== adminId) throw new NotFoundException('Only admin can approve requests');

    if (community.joinRequests && community.joinRequests.includes(requesterId)) {
      community.joinRequests = community.joinRequests.filter(id => id !== requesterId);
      community.memberCount = (community.memberCount || 0) + 1;
      await community.save();

      const user = await this.userModel.findById(requesterId).exec();
      if (user) {
        if (!user.joinedCommunities) user.joinedCommunities = [];
        if (!user.joinedCommunities.includes(communityId)) {
          user.joinedCommunities.push(communityId);
          await user.save();
        }
        
        // Emit real-time event
        this.eventsGateway.emitToUser(requesterId, 'COMMUNITY_REQUEST_APPROVED', {
          communityId: community._id.toString(),
          communityName: community.name
        });
      }
    }
    return { success: true };
  }

  async rejectJoinRequest(communityId: string, adminId: string, requesterId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== adminId) throw new NotFoundException('Only admin can reject requests');

    if (community.joinRequests && community.joinRequests.includes(requesterId)) {
      community.joinRequests = community.joinRequests.filter(id => id !== requesterId);
      await community.save();
    }
    return { success: true };
  }

  async getMembers(communityId: string) {
    const users = await this.userModel.find({ joinedCommunities: communityId }, 'username displayName avatarUrl initials role').exec();
    return users.map(u => ({ id: u._id.toString(), ...u.toObject(), _id: undefined, __v: undefined }));
  }

  async kickMember(communityId: string, adminId: string, targetUserId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== adminId) throw new NotFoundException('Only admin can kick members');
    if (community.creatorId === targetUserId) throw new NotFoundException('Cannot kick the creator');

    const user = await this.userModel.findById(targetUserId).exec();
    if (user && user.joinedCommunities && user.joinedCommunities.includes(communityId)) {
      user.joinedCommunities = user.joinedCommunities.filter(id => id !== communityId);
      await user.save();

      community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
      await community.save();

      // Emit real-time event
      this.eventsGateway.emitToUser(targetUserId, 'COMMUNITY_KICKED', { communityId });
    }
    return { success: true };
  }

  async inviteMember(communityId: string, adminId: string, username: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    if (community.creatorId !== adminId) throw new NotFoundException('Only admin can invite members');

    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new NotFoundException('User not found');

    if (!user.joinedCommunities) user.joinedCommunities = [];
    if (user.joinedCommunities.includes(communityId)) {
      throw new NotFoundException('User is already a member');
    }

    if (!user.communityInvites) user.communityInvites = [];
    if (user.communityInvites.includes(communityId)) {
      throw new NotFoundException('User has already been invited');
    }

    user.communityInvites.push(communityId);
    await user.save();

    // Emit real-time event
    this.eventsGateway.emitToUser(user._id.toString(), 'COMMUNITY_INVITE_RECEIVED', { 
      communityId, 
      communityName: community.name 
    });

    return { success: true, message: 'Invite sent successfully' };
  }

  async getMyInvites(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.communityInvites || user.communityInvites.length === 0) return [];
    
    const communities = await this.communityModel.find({ _id: { $in: user.communityInvites } }).exec();
    return communities.map(c => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  async acceptInvite(communityId: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (!user.communityInvites || !user.communityInvites.includes(communityId)) {
      throw new NotFoundException('No invite found');
    }

    user.communityInvites = user.communityInvites.filter(id => id !== communityId);
    
    if (!user.joinedCommunities) user.joinedCommunities = [];
    if (!user.joinedCommunities.includes(communityId)) {
      user.joinedCommunities.push(communityId);
      
      const community = await this.communityModel.findById(communityId).exec();
      if (community) {
        community.memberCount = (community.memberCount || 0) + 1;
        
        if (community.joinRequests && community.joinRequests.includes(user._id.toString())) {
          community.joinRequests = community.joinRequests.filter(id => id !== user._id.toString());
        }

        await community.save();

        // Emit real-time event
        this.eventsGateway.emitToUser(community.creatorId, 'COMMUNITY_INVITE_ACCEPTED', {
          communityId: community._id.toString(),
          communityName: community.name,
          userId: user._id.toString(),
          username: user.username,
          avatarUrl: user.avatarUrl
        });
      }
    }

    await user.save();
    return { success: true };
  }

  async rejectInvite(communityId: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (user.communityInvites && user.communityInvites.includes(communityId)) {
      user.communityInvites = user.communityInvites.filter(id => id !== communityId);
      await user.save();
    }
    return { success: true };
  }
  async promoteAdmin(communityId: string, adminId: string, targetUserId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');
    const isAdmin = community.creatorId === adminId || (community.adminIds && community.adminIds.includes(adminId));
    if (!isAdmin) throw new BadRequestException('Chỉ quản trị viên mới có thể phong quyền');

    const targetUser = await this.userModel.findById(targetUserId).exec();
    if (!targetUser) throw new NotFoundException('User not found');
    
    if (!targetUser.joinedCommunities || !targetUser.joinedCommunities.includes(communityId)) {
      throw new BadRequestException('Người dùng phải là thành viên trước khi được thăng quyền');
    }

    if (!targetUser.adminInvites) targetUser.adminInvites = [];
    if (!targetUser.adminInvites.includes(communityId)) {
      targetUser.adminInvites.push(communityId);
      await targetUser.save();

      // Phát sự kiện Real-time
      this.eventsGateway.emitToUser(targetUserId, 'COMMUNITY_ADMIN_INVITE_RECEIVED', {
        communityId,
        communityName: community.name
      });
    }

    return { success: true, message: 'Đã gửi lời mời làm Quản trị viên' };
  }

  async getMyAdminInvites(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.adminInvites || user.adminInvites.length === 0) return [];
    
    const communities = await this.communityModel.find({ _id: { $in: user.adminInvites } }).exec();
    return communities.map(c => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  async acceptAdminInvite(communityId: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (!user.adminInvites || !user.adminInvites.includes(communityId)) {
      throw new BadRequestException('Không tìm thấy lời mời quản trị viên');
    }

    user.adminInvites = user.adminInvites.filter(id => id !== communityId);
    await user.save();

    const community = await this.communityModel.findById(communityId).exec();
    if (community) {
      if (!community.adminIds) community.adminIds = [];
      if (!community.adminIds.includes(userId)) {
        community.adminIds.push(userId);
        await community.save();
        
        // Phát sự kiện Real-time tới admin khác
        this.eventsGateway.emitToUser(community.creatorId, 'COMMUNITY_ADMIN_INVITE_ACCEPTED', {
          communityId,
          userId,
          username: user.username,
          avatarUrl: user.avatarUrl
        });
      }
    }

    return { success: true };
  }

  async rejectAdminInvite(communityId: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (user.adminInvites && user.adminInvites.includes(communityId)) {
      user.adminInvites = user.adminInvites.filter(id => id !== communityId);
      await user.save();
    }

    return { success: true };
  }

  async resignAdmin(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) throw new NotFoundException('Community not found');

    const allAdminIds = Array.from(new Set([community.creatorId, ...(community.adminIds || [])]));
    if (!allAdminIds.includes(userId)) {
      throw new BadRequestException('Bạn không phải là quản trị viên');
    }

    if (allAdminIds.length <= 1) {
      throw new BadRequestException('Bạn là quản trị viên duy nhất. Không thể từ chức.');
    }

    if (community.adminIds && community.adminIds.includes(userId)) {
      community.adminIds = community.adminIds.filter(id => id !== userId);
    }
    
    // Nếu người từ chức là creator, nhường ngôi cho admin tiếp theo
    if (community.creatorId === userId) {
      const nextAdmin = community.adminIds && community.adminIds[0];
      if (nextAdmin) {
        community.creatorId = nextAdmin;
      }
    }

    await community.save();
    return { success: true };
  }
}
