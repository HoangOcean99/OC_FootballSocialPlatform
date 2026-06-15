import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('trending')
  async getTrendingPosts() {
    const posts = await this.postsService.getTrendingPosts();
    return posts.map((p) => ({ id: p._id.toString(), ...p.toObject(), _id: undefined, __v: undefined }));
  }
}
