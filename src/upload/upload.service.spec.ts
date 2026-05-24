import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveImage', () => {
    it('should return mapped file metadata including extension', async () => {
      // Створюємо фейковий файл, який імітує Express.Multer.File
      const mockFile = {
        originalname: 'test-avatar.jpg',
        filename: 'random-123-test-avatar.jpg',
        path: '/temp/uploads/random-123-test-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 51200, // 50 KB
      } as Express.Multer.File;

      const result = await service.saveImage(mockFile);

      // Перевіряємо, чи сервіс правильно змапив поля і визначив розширення '.jpg'
      expect(result).toEqual({
        originalName: 'test-avatar.jpg',
        filename: 'random-123-test-avatar.jpg',
        path: '/temp/uploads/random-123-test-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 51200,
        extension: '.jpg',
      });
    });

    it('should handle files without extensions correctly', async () => {
      const mockFileNoExt = {
        originalname: 'unknown-file',
        filename: 'random-456-unknown',
        path: '/temp/uploads/random-456-unknown',
        mimetype: 'application/octet-stream',
        size: 1024,
      } as Express.Multer.File;

      const result = await service.saveImage(mockFileNoExt);

      expect(result.extension).toBe('');
      expect(result.originalName).toBe('unknown-file');
    });
  });
});