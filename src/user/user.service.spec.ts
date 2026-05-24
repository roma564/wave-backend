import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';

describe('UserService', () => {
  let service: UserService;

  // 1. Створюємо мок НАПРЯМУ поза beforeEach і використовуємо його всюди
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    mode: {
      create: jest.fn(),
    },
  };

  const mockUser = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Очищаємо історію викликів перед кожним тестом
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and default modes', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.mode.create.mockResolvedValue({});

      const result = await service.create({
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
      } as any);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });
  });

  describe('remove', () => {
    it('should delete user by id', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findUsersByChatId', () => {
    it('should return users for a specific chat', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findUsersByChatId(10);

      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          chats: {
            some: { id: 10 },
          },
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });
  });

  describe('findByUsername', () => {
    it('should return user by email or name', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByUsername('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'john@example.com' }, { name: 'john@example.com' }],
        },
      });
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const updatedUser = { ...mockUser, avatar: 'new-avatar-url' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar('1', 'new-avatar-url');

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { avatar: 'new-avatar-url' },
      });
    });
  });
});