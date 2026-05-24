import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;

  // 1. Створюємо мок для ChatService (замість Prisma)
  const mockChatService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findManyByIds: jest.fn(),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Фейковий чат для повернення з тестів
  const mockChat = {
    id: 1,
    name: 'Test Chat',
    isGroup: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        // 2. Підміняємо справжній ChatService на наш мок
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat', async () => {
      const createChatDto = { name: 'Test Chat' };
      mockChatService.create.mockResolvedValue(mockChat);

      const result = await controller.create(createChatDto as any);

      expect(result).toEqual(mockChat);
      expect(mockChatService.create).toHaveBeenCalledWith(createChatDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of chats', async () => {
      mockChatService.findAll.mockResolvedValue([mockChat]);

      const result = await controller.findAll();

      expect(result).toEqual([mockChat]);
      expect(mockChatService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single chat by id', async () => {
      mockChatService.findOne.mockResolvedValue(mockChat);

      // Контролер приймає рядок '1' і має передати в сервіс число 1 (+id)
      const result = await controller.findOne('1');

      expect(result).toEqual(mockChat);
      expect(mockChatService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findChatsByIds', () => {
    it('should return multiple chats by parsed ids', async () => {
      mockChatService.findManyByIds.mockResolvedValue([mockChat]);

      // Передаємо рядок, який твій контролер має розпарсити
      const result = await controller.findChatsByIds('1,2,3');

      expect(result).toEqual([mockChat]);
      // Перевіряємо, чи контролер правильно розбив рядок на масив чисел
      expect(mockChatService.findManyByIds).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe('findAllByUser', () => {
    it('should return chats for a specific user', async () => {
      mockChatService.findAllByUser.mockResolvedValue([mockChat]);

      const result = await controller.findAllByUser('1');

      expect(result).toEqual([mockChat]);
      expect(mockChatService.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a chat', async () => {
      const updateChatDto = { name: 'Updated Chat' };
      const updatedChat = { ...mockChat, ...updateChatDto };
      
      mockChatService.update.mockResolvedValue(updatedChat);

      const result = await controller.update('1', updateChatDto as any);

      expect(result).toEqual(updatedChat);
      // Має передати число 1 та DTO
      expect(mockChatService.update).toHaveBeenCalledWith(1, updateChatDto);
    });
  });

  describe('remove', () => {
    it('should remove a chat', async () => {
      mockChatService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove('1');

      expect(result).toEqual({ deleted: true });
      expect(mockChatService.remove).toHaveBeenCalledWith(1);
    });
  });
});