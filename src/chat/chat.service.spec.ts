import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';
import { Chat, User } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockChat: Chat = {
    id: 1,
    subject: 'Test Chat',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
      chat: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat', async () => {
      prismaService.chat.create.mockResolvedValue(mockChat);

      const result = await service.create({ subject: 'Test Chat', userIds: [1, 2] };

      expect(result).toEqual(mockChat);
      expect(prismaService.chat.create).toHaveBeenCalledWith({
        data: {
          subject: 'Test Chat',
          users: { connect: [{ id: 1 }, { id: 2 }] },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all chats', async () => {
      prismaService.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findAll();

      expect(result).toEqual([mockChat]);
    });
  });

  describe('findOne', () => {
    it('should return chat by id', async () => {
      prismaService.chat.findUnique.mockResolvedValue(mockChat);

      const result = await service.findOne(1);

      expect(result).toEqual(mockChat);
    });
  });

  describe('findManyByIds', () => {
    it('should return chats by ids', async () => {
      prismaService.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findManyByIds([1, 2]);

      expect(result).toEqual([mockChat]);
      expect(prismaService.chat.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return all chats for a user', async () => {
      prismaService.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([mockChat]);
      expect(prismaService.chat.findMany).toHaveBeenCalledWith({
        where: { users: { some: { id: 1 } } },
      });
    });
  });

  describe('findUsersByChatId', () => {
    it('should return users in a chat', async () => {
      prismaService.chat.findUnique.mockResolvedValue({ ...mockChat, users: [mockUser] };

      const result = await service.findUsersByChatId(1);

      expect(result).toEqual([mockUser]);
    });

    it('should return empty array if chat not found', async () => {
      prismaService.chat.findUnique.mockResolvedValue(null);

      const result = await service.findUsersByChatId(999);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update chat subject', async () => {
      const updatedChat = { ...mockChat, subject: 'Updated Subject' };
      prismaService.chat.update.mockResolvedValue(updatedChat);

      const result = await service.update(1, { subject: 'Updated Subject' });

      expect(result).toEqual(updatedChat);
    });
  });

  describe('remove', () => {
    it('should delete chat by id', async () => {
      prismaService.chat.delete.mockResolvedValue(mockChat);

      await service.remove(1);

      expect(prismaService.chat.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
