import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  Logger
} from '@nestjs/common'
import * as fs from 'fs'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { diskStorage } from 'multer'
import * as path from 'path'
import { UserService } from '../user/user.service'
import { S3Service } from './s3.service';


@Controller('files')
export class UploadController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service
   
  ) {}
   private readonly logger = new Logger(UploadController.name)


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const uniqueKey = Date.now() + '-' + file.originalname;

    await this.s3Service.uploadFile(process.env.SUPABASE_BUCKET as string, uniqueKey, file.buffer, file.mimetype);

    return {
      key: uniqueKey,
      bucket: process.env.SUPABASE_BUCKET,
      mimeType: file.mimetype,
      size: file.size,
      url: `${process.env.SUPABASE_S3_ENDPOINT}/${process.env.SUPABASE_BUCKET}/${uniqueKey}`,
    };
  }




  @Get('download')
  async downloadFile(
    @Query('fileUrl') fileUrl: string | undefined,
    @Res() res: Response,
  ) {
    if (!fileUrl) {
      throw new BadRequestException('fileUrl не передано');
    }

    const savedFileName = fileUrl.split('/').pop();
    if (!savedFileName) {
      throw new BadRequestException('Неможливо витягнути ім’я файлу з fileUrl');
    }

    try {
      const { stream, contentType } = await this.s3Service.downloadFile(
        process.env.SUPABASE_BUCKET!,
        savedFileName,
      );

      res.setHeader('Content-Disposition', `attachment; filename="${savedFileName}"`);
      res.setHeader('Content-Type', contentType);

      stream.pipe(res);
    } catch (error) {
      throw new BadRequestException(`Помилка при завантаженні: ${error.message}`);
    }
  }



  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Непідтримуваний тип файлу'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // максимум 2MB
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
  if (!file) {
    throw new BadRequestException('Аватар не завантажено');
  }

  const userId = req.body.userId;
  if (!userId) {
    throw new BadRequestException('userId is required');
  }

  const uniqueKey = `avatars/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

  // вантажимо у S3 через сервіс
  await this.s3Service.uploadFile(
    process.env.SUPABASE_BUCKET!,
    uniqueKey,
    file.buffer,
    file.mimetype,
  );

  // формуємо ПУБЛІЧНИЙ URL
  const avatarUrl = `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${uniqueKey}`;

  await this.userService.updateAvatar(userId, avatarUrl);

  return {
    avatarUrl,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}


 



 

  @Get('avatar')
  async downloadAvatar(
  @Query('avatarUrl') avatarUrl: string | undefined,
  @Res() res: Response,
) {
  if (!avatarUrl) {
    throw new BadRequestException('avatarUrl не передано');
  }

  const savedFileName = avatarUrl.split('/').pop();
  if (!savedFileName) {
    throw new BadRequestException('Неможливо витягнути ім’я файлу з avatarUrl');
  }

  try {
    const { stream, contentType } = await this.s3Service.downloadFile(
      process.env.SUPABASE_BUCKET!,
      `avatars/${savedFileName}`, // avatars/ folder
    );

    res.setHeader('Content-Disposition', `inline; filename="${savedFileName}"`);
    res.setHeader('Content-Type', contentType);

    stream.pipe(res);
  } catch (error) {
    throw new BadRequestException(`Помилка при завантаженні аватара: ${error.message}`);
  }
}



}



