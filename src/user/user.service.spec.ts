import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser: User = {
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
    const mockPrisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      mode: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and default modes', async () => {
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.mode.create.mockResolvedValue({ id: 1, name: 'default', userId: 1, theme: 'dark', createdAt: new Date(), updatedAt: new Date() } as any);

      const result = await service.create({
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
      });

      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.mode.create).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getById(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      prismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });
  });

  describe('remove', () => {
    it('should delete user by id', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUsername', () => {
    it('should return user by email or name', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByUsername('john@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'john@example.com' }, { name: 'john@example.com' }],
        },
      });
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const updatedUser = { ...mockUser, avatar: 'new-avatar-url' };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar('1', 'new-avatar-url');

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { avatar: 'new-avatar-url' },
      });
    });
  });
});
