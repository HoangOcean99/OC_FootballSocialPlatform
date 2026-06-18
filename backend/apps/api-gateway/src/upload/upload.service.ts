import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  uploadFile(file: Express.Multer.File, folderPath?: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const folderName = folderPath ? `football-social/${folderPath}` : 'football-social';
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Unknown error during upload'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    if (!publicId) return null;
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Deleted image ${publicId} from Cloudinary: ${result.result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete image ${publicId} from Cloudinary`, error);
      throw error;
    }
  }

  extractPublicId(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
      // url = https://res.cloudinary.com/cloud_name/image/upload/v1234567890/football-social/abcdef.jpg
      const parts = url.split('/');
      const lastParts = parts.slice(parts.findIndex(p => p.startsWith('v')) + 1);
      const publicIdWithExt = lastParts.join('/');
      const publicId = publicIdWithExt.split('.')[0];
      return publicId;
    } catch (e) {
      return null;
    }
  }
}
