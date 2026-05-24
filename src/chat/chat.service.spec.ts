import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';
import { Chat, User } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;

  const mockChat: Chat = {
    id: 1,
    subject: 'Test Chat',
    createdDate: new Date(),
  };

  const mockUser: User = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    avatar: null,
  };

  const mockPrisma = {
    chat: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat', async () => {
      mockPrisma.chat.create.mockResolvedValue(mockChat);

      const result = await service.create({ subject: 'Test Chat', userIds: [1, 2] });

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.create).toHaveBeenCalledWith({
        data: {
          subject: 'Test Chat',
          users: { connect: [{ id: 1 }, { id: 2 }] },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all chats', async () => {
      mockPrisma.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findAll();

      expect(result).toEqual([mockChat]);
    });
  });

  describe('findOne', () => {
    it('should return chat by id', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(mockChat);

      const result = await service.findOne(1);

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });

  describe('findManyByIds', () => {
    it('should return chats by ids', async () => {
      mockPrisma.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findManyByIds([1, 2]);

      expect(result).toEqual([mockChat]);
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return all chats for a user', async () => {
      mockPrisma.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([mockChat]);
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        where: { users: { some: { id: 1 } } },
      });
    });
  });

  describe('findUsersByChatId', () => {
    it('should return users in a chat', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue({ ...mockChat, users: [mockUser] } as any);

      const result = await service.findUsersByChatId(1);

      expect(result).toEqual([mockUser]);
      expect(mockPrisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { users: true }
      });
    });

    it('should return empty array if chat not found', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(null);

      const result = await service.findUsersByChatId(999);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update chat subject', async () => {
      const updatedChat = { ...mockChat, subject: 'Updated Subject' };
      mockPrisma.chat.update.mockResolvedValue(updatedChat);

      const result = await service.update(1, { subject: 'Updated Subject' } as any);

      expect(result).toEqual(updatedChat);
      expect(mockPrisma.chat.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { subject: 'Updated Subject' }
      });
    });
  });

  describe('remove', () => {
    it('should delete chat by id', async () => {
      mockPrisma.chat.delete.mockResolvedValue(mockChat);

      await service.remove(1);

      expect(mockPrisma.chat.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});