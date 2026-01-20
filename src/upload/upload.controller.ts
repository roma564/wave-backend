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
} from '@nestjs/common'
import * as fs from 'fs'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { diskStorage } from 'multer'
import * as path from 'path'
import { UserService } from '../user/user.service'


@Controller('upload')
export class UploadController {
  constructor(private readonly userService: UserService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/files',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))

      },
    }),
  }))

  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не завантажено')

    return {
      path: `/uploads/files/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    }
  }

@Get('download')
downloadFile(
  @Query('fileUrl') fileUrl: string | undefined,
  @Query('fileName') fileName: string | undefined,
  @Res() res: Response
) {
  if (!fileUrl) {
    throw new BadRequestException('fileUrl не передано')
  }

  const savedFileName = fileUrl?.split('/').pop()
  if (!savedFileName) {
    throw new BadRequestException('Неможливо витягнути ім’я файлу з fileUrl')
  }

  const filePath = path.join(process.cwd(), 'uploads', 'files', savedFileName)

  if (!fs.existsSync(filePath)) {
    throw new BadRequestException('Файл не знайдено')
  }

  const downloadName = fileName || savedFileName
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
  res.sendFile(filePath)
}

 


  @Post('avatar')
@UseInterceptors(
  FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    }),
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

  const avatarUrl = `/uploads/avatars/${file.filename}`;

  // беремо userId з form-data
  const userId = req.body.userId;
  if (!userId) {
    throw new BadRequestException('userId is required');
  }

  await this.userService.updateAvatar(userId, avatarUrl);

  return {
    avatarUrl,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}


 

  @Get('avatar')
  downloadAvatar(
    @Query('avatarUrl') avatarUrl: string | undefined,
    @Query('fileName') fileName: string | undefined,
    @Res() res: Response
  ) {
    if (!avatarUrl) {
      throw new BadRequestException('avatarUrl не передано');
    }

    const savedFileName = avatarUrl.split('/').pop();
    if (!savedFileName) {
      throw new BadRequestException('Неможливо витягнути ім’я файлу з avatarUrl');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'avatars', savedFileName);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Аватар не знайдено');
    }

    const downloadName = fileName || savedFileName;
    res.setHeader('Content-Disposition', `inline; filename="${downloadName}"`);
    res.sendFile(filePath);
  }



}



