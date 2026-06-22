import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /** Helper: map a post document to a serializable object with reactionCounts + myReaction */
  private mapPost(p: any, userId?: string) {
    const obj = p.toObject ? p.toObject() : { ...p };
    const reactionsRaw = obj.reactions || {};

    // Mongoose Map toObject() gives a Map instance. We must handle both Map and plain object.
    const reactionCounts: Record<string, number> = {};
    let myReaction: string | null = null;
    let likesCount = 0;

    if (reactionsRaw instanceof Map || (reactionsRaw && typeof reactionsRaw.forEach === 'function')) {
      reactionsRaw.forEach((type: any, uid: any) => {
        const t = type as string;
        reactionCounts[t] = (reactionCounts[t] || 0) + 1;
        if (userId && uid === userId) myReaction = t;
        likesCount++;
      });
    } else if (reactionsRaw) {
      Object.entries(reactionsRaw).forEach(([uid, type]) => {
        const t = type as string;
        reactionCounts[t] = (reactionCounts[t] || 0) + 1;
        if (userId && uid === userId) myReaction = t;
        likesCount++;
      });
    }

    return {
      id: p._id.toString(),
      ...obj,
      _id: undefined,
      __v: undefined,
      reactions: undefined,          // never expose raw userId map
      likes: likesCount,
      reactionCounts,
      myReaction,
      isLiked: myReaction !== null,
    };
  }

  @Get('trending')
  @UseGuards(JwtAuthGuard)
  async getTrendingPosts(@Request() req: any) {
    const posts = await this.postsService.getTrendingPosts();
    return posts.map((p) => this.mapPost(p, req.user.sub));
  }

  @Get(':id/reactions')
  async getPostReactions(@Param('id') id: string) {
    return this.postsService.getPostReactions(id);
  }

  @Post(':id/react')
  @UseGuards(JwtAuthGuard)
  async reactToPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reaction: string | null }
  ) {
    return this.postsService.reactToPost(id, req.user.sub, body.reaction);
  }

  @Post('community/:communityId')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Request() req: any,
    @Param('communityId') communityId: string,
    @Body() body: { content: string; image?: string }
  ) {
    const post = await this.postsService.createPost(communityId, req.user.sub, body.content, body.image);
    return this.mapPost(post, req.user.sub);
  }

  @Get('community/:communityId')
  @UseGuards(JwtAuthGuard)
  async getCommunityPosts(@Request() req: any, @Param('communityId') communityId: string) {
    const posts = await this.postsService.getCommunityPosts(communityId);
    return posts.map((p) => this.mapPost(p, req.user.sub));
  }

  @Get('community/:communityId/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingPosts(@Request() req: any, @Param('communityId') communityId: string) {
    const posts = await this.postsService.getPendingPosts(communityId, req.user.sub);
    return posts.map((p) => this.mapPost(p, req.user.sub));
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approvePost(@Request() req: any, @Param('id') id: string) {
    const post = await this.postsService.approvePost(id, req.user.sub);
    return this.mapPost(post, req.user.sub);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectPost(@Request() req: any, @Param('id') id: string) {
    const post = await this.postsService.rejectPost(id, req.user.sub);
    return this.mapPost(post, req.user.sub);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Request() req: any,
    @Param('postId') id: string,
    @Body() body: { content: string; parentId?: string; image?: string }
  ) {
    const comment = await this.postsService.createComment(id, req.user.sub, body.content, body.parentId, body.image);
    return { id: comment._id.toString(), ...comment.toObject(), _id: undefined, __v: undefined };
  }

  @Get(':id/comments')
  async getPostComments(@Param('id') id: string) {
    const comments = await this.postsService.getPostComments(id);
    return comments.map(c => this.mapComment(c));
  }

  private mapComment(c: any) {
    const mapped = { id: c._id.toString(), ...c, _id: undefined, __v: undefined };
    if (mapped.replies && mapped.replies.length > 0) {
      mapped.replies = mapped.replies.map((r: any) => this.mapComment(r));
    }
    return mapped;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.deletePost(id, req.user.sub);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Request() req: any, @Param('commentId') commentId: string) {
    return this.postsService.deleteComment(commentId, req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPostById(@Request() req: any, @Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return this.mapPost(post, req.user.sub);
  }
}
