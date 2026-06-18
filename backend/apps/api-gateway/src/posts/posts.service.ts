import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { Comment, CommentDocument } from './comment.schema';
import { CommunitiesService } from '../communities/communities.service';
import { UsersService } from '../users/users.service';

import { UploadService } from '../upload/upload.service';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private communitiesService: CommunitiesService,
    private usersService: UsersService,
    private uploadService: UploadService,
    private eventsGateway: EventsGateway,
  ) {}

  async getTrendingPosts() {
    return this.postModel.find({ status: 'APPROVED' }).sort({ likes: -1 }).limit(10).exec();
  }

  async getPostById(postId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async reactToPost(postId: string, userId: string, reactionType: string | null) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const reactions = post.reactions || new Map<string, string>();
    const existingReaction = reactions.get(userId);

    if (reactionType === null) {
      // Remove reaction
      reactions.delete(userId);
    } else {
      // Set/update reaction
      reactions.set(userId, reactionType);
    }

    // Rebuild likes count from reactions map
    post.reactions = reactions;
    post.likes = reactions.size;
    post.isLiked = reactions.has(userId);
    await post.save();

    return {
      likes: post.likes,
      myReaction: reactions.get(userId) || null,
      reactionCounts: this.countReactions(reactions),
    };
  }

  private countReactions(reactions: Map<string, string>) {
    const counts: Record<string, number> = {};
    reactions.forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  async createPost(communityId: string, userId: string, content: string, image?: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const community = await this.communitiesService.getCommunityById(communityId);
    if (!community) throw new NotFoundException('Community not found');

    // Determine status based on requirePostApproval and user's role in community
    let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'APPROVED';
    if (community.requirePostApproval) {
      const allAdminIds = [community.creatorId, ...(community.adminIds || [])];
      if (!allAdminIds.includes(userId)) {
        status = 'PENDING';
      }
    }

    const newPost = new this.postModel({
      author: {
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || '',
        avatarColor: user.avatarColor || '#3b82f6',
        initials: user.initials || user.username.substring(0, 2).toUpperCase(),
        level: user.level || 1,
        levelTitle: user.levelTitle || 'Tân binh'
      },
      community: {
        name: community.name,
        slug: community.slug,
        emoji: community.logo && community.logo.length <= 4 ? community.logo : '⚽'
      },
      content,
      image,
      shares: 0,
      status,
      tags: [],
    });
    await newPost.save();

    if (status === 'APPROVED') {
      this.eventsGateway.server.emit('COMMUNITY_POST_CREATED', {
        communityId,
        post: { id: newPost._id.toString(), ...newPost.toObject(), _id: undefined, __v: undefined }
      });
    }

    return newPost;
  }

  async getCommunityPosts(communityId: string) {
    const community = await this.communitiesService.getCommunityById(communityId);
    if (!community) throw new NotFoundException('Community not found');
    
    // Using simple match on slug or name for now, better to use a ref to communityId, 
    // but the schema embeds community info. We match by community slug.
    return this.postModel.find({ 
      'community.slug': community.slug,
      status: 'APPROVED'
    }).sort({ createdAt: -1 }).exec();
  }

  async getPendingPosts(communityId: string, userId: string) {
    const community = await this.communitiesService.getCommunityById(communityId);
    if (!community) throw new NotFoundException('Community not found');

    const allAdminIds = [community.creatorId, ...(community.adminIds || [])];
    if (!allAdminIds.includes(userId)) {
      throw new ForbiddenException('Only admins can view pending posts');
    }

    return this.postModel.find({ 
      'community.slug': community.slug,
      status: 'PENDING'
    }).sort({ createdAt: -1 }).exec();
  }

  async approvePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const community = await this.communitiesService.getCommunityBySlug(post.community.slug);
    if (!community) throw new NotFoundException('Community not found');

    const allAdminIds = [community.creatorId, ...(community.adminIds || [])];
    if (!allAdminIds.includes(userId)) {
      throw new ForbiddenException('Only admins can approve posts');
    }

    post.status = 'APPROVED';
    return post.save();
  }

  async rejectPost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const community = await this.communitiesService.getCommunityBySlug(post.community.slug);
    if (!community) throw new NotFoundException('Community not found');

    const allAdminIds = [community.creatorId, ...(community.adminIds || [])];
    if (!allAdminIds.includes(userId)) {
      throw new ForbiddenException('Only admins can reject posts');
    }

    post.status = 'REJECTED';
    return post.save();
  }

  async createComment(postId: string, userId: string, content: string, parentId?: string, image?: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (parentId) {
      const parentComment = await this.commentModel.findById(parentId).exec();
      if (!parentComment) throw new NotFoundException('Parent comment not found');
    }

    const comment = new this.commentModel({
      postId,
      author: {
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || '',
        avatarColor: user.avatarColor || '#3b82f6',
        initials: user.initials || user.username.substring(0, 2).toUpperCase(),
        level: user.level || 1,
        levelTitle: user.levelTitle || 'Tân binh'
      },
      content,
      image,
      parentId
    });

    await comment.save();
    
    // Increment post comments count
    post.comments += 1;
    await post.save();

    const community = await this.communitiesService.getCommunityBySlug(post.community.slug);
    if (community) {
      this.eventsGateway.server.emit('COMMUNITY_COMMENT_CREATED', {
        communityId: community._id.toString(),
        postId: post._id.toString(),
        comment: { id: comment._id.toString(), ...comment.toObject(), _id: undefined, __v: undefined }
      });
    }

    return comment;
  }

  async getPostComments(postId: string) {
    // Get all comments for post
    const comments = await this.commentModel.find({ postId }).sort({ createdAt: 1 }).exec();
    
    // Build tree
    const commentMap = new Map<string, any>();
    const roots: any[] = [];

    comments.forEach(c => {
      const doc = c.toObject() as any;
      doc.replies = [];
      commentMap.set(doc._id.toString(), doc);
    });

    comments.forEach(c => {
      const doc = commentMap.get(c._id.toString());
      if (c.parentId) {
        const parent = commentMap.get(c.parentId.toString());
        if (parent) {
          parent.replies.push(doc);
        } else {
          // Fallback if parent missing
          roots.push(doc);
        }
      } else {
        roots.push(doc);
      }
    });

    return roots;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const community = await this.communitiesService.getCommunityBySlug(post.community.slug);
    if (!community) throw new NotFoundException('Community not found');

    const isAdmin = community.creatorId === userId || (community.adminIds && community.adminIds.includes(userId));
    const isAuthor = post.author.username === (await this.usersService.findById(userId))?.username;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    if (post.image) {
      try {
        const publicId = this.uploadService.extractPublicId(post.image);
        if (publicId) {
          await this.uploadService.deleteFile(publicId);
        }
      } catch (err) {
        console.error('Failed to delete post image from cloudinary', err);
      }
    }

    // Find and delete images of all comments under this post
    const commentsWithImages = await this.commentModel.find({ postId, image: { $exists: true, $ne: null } }).exec();
    for (const c of commentsWithImages) {
      if (c.image) {
        try {
          const publicId = this.uploadService.extractPublicId(c.image);
          if (publicId) await this.uploadService.deleteFile(publicId);
        } catch (err) {
          console.error('Failed to delete comment image from cloudinary', err);
        }
      }
    }

    await this.commentModel.deleteMany({ postId }).exec();
    await this.postModel.findByIdAndDelete(postId).exec();
    
    return { success: true };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');

    const post = await this.postModel.findById(comment.postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const community = await this.communitiesService.getCommunityBySlug(post.community.slug);
    
    const isAdmin = community && (community.creatorId === userId || (community.adminIds && community.adminIds.includes(userId)));
    const isAuthor = comment.author.username === (await this.usersService.findById(userId))?.username;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    // Find and delete images of this comment and its replies
    const commentsToDelete = await this.commentModel.find({ $or: [{ _id: commentId }, { parentId: commentId }] }).exec();
    for (const c of commentsToDelete) {
      if (c.image) {
        try {
          const publicId = this.uploadService.extractPublicId(c.image);
          if (publicId) await this.uploadService.deleteFile(publicId);
        } catch (err) {
          console.error('Failed to delete comment image from cloudinary', err);
        }
      }
    }

    await this.commentModel.deleteMany({ $or: [{ _id: commentId }, { parentId: commentId }] }).exec();
    
    // Decrement post comments count
    await this.postModel.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } }).exec();

    return { success: true };
  }
}
