import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('trending')
  async getTrendingPosts() {
    const posts = await this.postsService.getTrendingPosts();
    return posts.map((p) => ({ id: p._id.toString(), ...p.toObject(), _id: undefined, __v: undefined }));
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
    return { id: post._id.toString(), ...post.toObject(), _id: undefined, __v: undefined };
  }

  @Get('community/:communityId')
  async getCommunityPosts(@Param('communityId') communityId: string) {
    const posts = await this.postsService.getCommunityPosts(communityId);
    return posts.map((p) => ({ id: p._id.toString(), ...p.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('community/:communityId/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingPosts(@Request() req: any, @Param('communityId') communityId: string) {
    const posts = await this.postsService.getPendingPosts(communityId, req.user.sub);
    return posts.map((p) => ({ id: p._id.toString(), ...p.toObject(), _id: undefined, __v: undefined }));
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approvePost(@Request() req: any, @Param('id') id: string) {
    const post = await this.postsService.approvePost(id, req.user.sub);
    return { id: post._id.toString(), ...post.toObject(), _id: undefined, __v: undefined };
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectPost(@Request() req: any, @Param('id') id: string) {
    const post = await this.postsService.rejectPost(id, req.user.sub);
    return { id: post._id.toString(), ...post.toObject(), _id: undefined, __v: undefined };
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
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return { id: post._id.toString(), ...post.toObject(), _id: undefined, __v: undefined };
  }
}
