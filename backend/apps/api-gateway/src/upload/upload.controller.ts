import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp file ảnh');
    }
    const result = await this.uploadService.uploadFile(file, folder);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}
