import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import { File } from 'multer';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class UploadService {
  async saveImage(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname),
    };
    
  }

  
}
