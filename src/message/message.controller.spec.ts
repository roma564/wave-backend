import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;

  // 1. Створюємо мок для MessageService
  const mockMessageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByChat: jest.fn(),
    findLast: jest.fn(),
    findAllLast: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Фейкове повідомлення для тестів
  const mockMessage = {
    id: 1,
    type: 'TEXT',
    content: 'Hello World',
    chatId: 10,
    userId: 2,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      mockMessageService.create.mockResolvedValue(mockMessage);
      
      const createMessageDto = { type: 'TEXT', content: 'Hello World', chatId: 10, userId: 2 };
      
      const result = await controller.create(createMessageDto as any);

      expect(result).toEqual(mockMessage);
      expect(mockMessageService.create).toHaveBeenCalledWith(createMessageDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of all messages', async () => {
      mockMessageService.findAll.mockResolvedValue([mockMessage]);
      
      const result = await controller.findAll();

      expect(result).toEqual([mockMessage]);
      expect(mockMessageService.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllByChat', () => {
    it('should return all messages for a specific chat', async () => {
      mockMessageService.findAllByChat.mockResolvedValue([mockMessage]);
      
      // Контролер приймає рядок '10' з @Param
      const result = await controller.findAllByChat('10');

      expect(result).toEqual([mockMessage]);
      // Сервіс має отримати число 10
      expect(mockMessageService.findAllByChat).toHaveBeenCalledWith(10);
    });
  });

  describe('findLast', () => {
    it('should return the last message for a specific chat', async () => {
      mockMessageService.findLast.mockResolvedValue(mockMessage);
      
      const result = await controller.findLast('10');

      expect(result).toEqual(mockMessage);
      expect(mockMessageService.findLast).toHaveBeenCalledWith(10);
    });
  });

  describe('findAllLast', () => {
    it('should return the last messages for all chats', async () => {
      mockMessageService.findAllLast.mockResolvedValue([mockMessage]);
      
      const result = await controller.findAllLast();

      expect(result).toEqual([mockMessage]);
      expect(mockMessageService.findAllLast).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const updateMessageDto = { content: 'Updated content' };
      const updatedMessage = { ...mockMessage, content: 'Updated content' };
      
      mockMessageService.update.mockResolvedValue(updatedMessage);
      
      const result = await controller.update('1', updateMessageDto as any);

      expect(result).toEqual(updatedMessage);
      expect(mockMessageService.update).toHaveBeenCalledWith(1, updateMessageDto);
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      mockMessageService.remove.mockResolvedValue(mockMessage);
      
      const result = await controller.remove('1');

      expect(result).toEqual(mockMessage);
      expect(mockMessageService.remove).toHaveBeenCalledWith(1);
    });
  });
});