import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma.service';
import { ChatService } from '../chat/chat.service';
import { MessageType } from '@prisma/client';

describe('MessageService', () => {
  let service: MessageService;

  // 1. Мокаємо PrismaService
  const mockPrisma = {
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  // 2. Мокаємо ChatService, який використовується в findAllLast
  const mockChatService = {
    findAll: jest.fn(),
  };

  // Фейкове повідомлення
  const mockMessage = {
    id: 1,
    type: MessageType.TEXT,
    content: 'Hello World',
    chatId: 10,
    userId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      name: 'John',
      lastname: 'Doe',
      avatar: null,
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a message and return it with user details', async () => {
      // Мокаємо перший запит (створення)
      mockPrisma.message.create.mockResolvedValue({ id: 1 });
      // Мокаємо другий запит (пошук створеного повідомлення з юзером)
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      const dto = {
        type: MessageType.TEXT,
        content: 'Hello World',
        chatId: 10,
        userId: 2,
      };

      const result = await service.create(dto as any);

      expect(result).toEqual(mockMessage);
      
      // Перевіряємо, чи правильно передалися дані в Prisma при створенні (з null для файлів)
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          type: 'TEXT',
          content: 'Hello World',
          chatId: 10,
          userId: 2,
          fileUrl: null,
          fileName: null,
          fileSize: null,
          mimeType: null,
        },
        include: {
          user: true,
          chat: true,
        },
      });

      // Перевіряємо, чи викликався findUnique після створення
      expect(mockPrisma.message.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: {
            select: { name: true, lastname: true, avatar: true },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      mockPrisma.message.findMany.mockResolvedValue([mockMessage]);

      const result = await service.findAll();

      expect(result).toEqual([mockMessage]);
      expect(mockPrisma.message.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single message by id', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: {
            select: { name: true, lastname: true, avatar: true },
          },
        },
      });
    });
  });

  describe('findAllByChat', () => {
    it('should return all messages for a specific chat', async () => {
      mockPrisma.message.findMany.mockResolvedValue([mockMessage]);

      const result = await service.findAllByChat(10);

      expect(result).toEqual([mockMessage]);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: 10 },
        include: {
          user: {
            select: { name: true, lastname: true, avatar: true },
          },
        },
      });
    });
  });

  describe('findLast', () => {
    it('should return the last message for a chat', async () => {
      mockPrisma.message.findFirst.mockResolvedValue(mockMessage);

      const result = await service.findLast(10);

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.findFirst).toHaveBeenCalledWith({
        where: { chatId: 10 },
        orderBy: { id: 'desc' },
        include: {
          user: {
            select: { name: true, lastname: true, avatar: true },
          },
        },
      });
    });
  });

  describe('findAllLast', () => {
    it('should return the last message of all chats and filter out nulls', async () => {
      // 1. Мокаємо ChatService, щоб повернув два чати
      mockChatService.findAll.mockResolvedValue([{ id: 10 }, { id: 20 }]);
      
      // 2. Мокаємо Prisma findFirst: 
      // Для першого чату повертаємо повідомлення, для другого — null (пустий чат)
      mockPrisma.message.findFirst
        .mockResolvedValueOnce(mockMessage) // Виклик для chat.id = 10
        .mockResolvedValueOnce(null);       // Виклик для chat.id = 20

      const result = await service.findAllLast();

      // Має повернути тільки mockMessage, бо null відфільтровується
      expect(result).toEqual([mockMessage]);
      expect(mockChatService.findAll).toHaveBeenCalled();
      expect(mockPrisma.message.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update a message content', async () => {
      const updatedMessage = { ...mockMessage, content: 'Updated' };
      mockPrisma.message.update.mockResolvedValue(updatedMessage);

      const result = await service.update(1, { content: 'Updated' });

      expect(result).toEqual(updatedMessage);
      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      mockPrisma.message.delete.mockResolvedValue(mockMessage);

      const result = await service.remove(1);

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});