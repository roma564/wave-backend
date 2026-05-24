import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UserService } from '../user/user.service';
import { S3Service } from './s3.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';

describe('UploadController', () => {
  let controller: UploadController;

  const mockUserService = {
    updateAvatar: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
  };

  const mockPrismaService = {
    message: {
      findFirst: jest.fn(),
    },
  };

  // Фейковий файл Multer
  const mockFile = {
    originalname: 'test-image.png',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('file-content'),
  } as Express.Multer.File;

  // Фейковий об'єкт відповіді Express (Response)
  const mockResponse = {
    setHeader: jest.fn(),
  } as unknown as Response;

  // Фейковий потік (Stream) для скачування файлу
  const mockStream = {
    pipe: jest.fn(),
  };

  // Зберігаємо оригінальні змінні оточення, щоб відновити їх після тестів
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.clearAllMocks();

    // ЖОРСТКО вимикаємо всі методи NestJS Logger, щоб не було жодного червоного тексту
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    // Вимикаємо звичайні логи в консолі для тестів
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Задаємо фейкові змінні оточення
    process.env = {
      ...originalEnv,
      SUPABASE_BUCKET: 'test-bucket',
      SUPABASE_PROJECT_REF: 'test-ref',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  afterAll(() => {
    // Відновлюємо змінні оточення після всіх тестів
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a file and return metadata', async () => {
      mockS3Service.uploadFile.mockResolvedValue(undefined);

      const result = await controller.upload(mockFile);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        'test-bucket',
        expect.stringContaining('uploads/'),
        mockFile.buffer,
        mockFile.mimetype,
      );

      expect(result).toEqual({
        key: expect.stringContaining('uploads/'),
        bucket: 'test-bucket',
        mimeType: 'image/png',
        size: 1024,
        url: expect.stringContaining('https://test-ref.supabase.co/storage/v1/object/public/test-bucket/uploads/'),
      });
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.upload(undefined as any)).rejects.toThrow(BadRequestException);
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if S3 upload fails', async () => {
      mockS3Service.uploadFile.mockRejectedValue(new Error('S3 error'));

      await expect(controller.upload(mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue({ fileName: 'original.png' });
      mockS3Service.downloadFile.mockResolvedValue({
        stream: mockStream,
        contentType: 'image/png',
      });

      await controller.downloadFile('https://test.com/file123.png', mockResponse);

      expect(mockPrismaService.message.findFirst).toHaveBeenCalledWith({
        where: { fileUrl: { contains: 'file123.png' } },
        select: { fileName: true },
      });

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="original.png"');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw BadRequestException if fileUrl is missing', async () => {
      await expect(controller.downloadFile(undefined, mockResponse)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if S3 download fails', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue(null);
      mockS3Service.downloadFile.mockRejectedValue(new Error('S3 error'));

      await expect(controller.downloadFile('https://test.com/file123.png', mockResponse)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload an avatar and update user', async () => {
      const mockReq = { body: { userId: 1 } };
      mockS3Service.uploadFile.mockResolvedValue(undefined);
      mockUserService.updateAvatar.mockResolvedValue(undefined);

      const result = await controller.uploadAvatar(mockFile, mockReq);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        'test-bucket',
        expect.stringContaining('avatars/'),
        mockFile.buffer,
        mockFile.mimetype,
      );

      expect(mockUserService.updateAvatar).toHaveBeenCalledWith(1, expect.stringContaining('https://test-ref.supabase.co'));

      expect(result).toEqual({
        avatarUrl: expect.stringContaining('https://test-ref.supabase.co'),
        fileName: 'test-image.png',
        fileSize: 1024,
        mimeType: 'image/png',
      });
    });

    it('should throw BadRequestException if no file is provided', async () => {
      const mockReq = { body: { userId: 1 } };
      await expect(controller.uploadAvatar(undefined as any, mockReq)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if userId is not in body', async () => {
      const mockReq = { body: {} };
      await expect(controller.uploadAvatar(mockFile, mockReq)).rejects.toThrow(BadRequestException);
    });
  });

  describe('downloadAvatar', () => {
    it('should download an avatar successfully', async () => {
      mockS3Service.downloadFile.mockResolvedValue({
        stream: mockStream,
        contentType: 'image/jpeg',
      });

      await controller.downloadAvatar('https://test.com/avatar123.jpg', mockResponse);

      expect(mockS3Service.downloadFile).toHaveBeenCalledWith('test-bucket', 'avatars/avatar123.jpg');
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="avatar123.jpg"');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw BadRequestException if avatarUrl is missing', async () => {
      await expect(controller.downloadAvatar(undefined, mockResponse)).rejects.toThrow(BadRequestException);
    });
  });
});