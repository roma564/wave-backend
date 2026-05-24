import { Test, TestingModule } from '@nestjs/testing';
import { Gateway } from './gateway.gateway';
import { GatewayService } from './gateway.service';
import { ChatService } from '../chat/chat.service';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';

describe('Gateway', () => {
  let gateway: Gateway;

  // 1. Мокаємо всі сервіси, які є в конструкторі Gateway
  const mockGatewayService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockChatService = {
    create: jest.fn(),
  };

  const mockMessageService = {
    create: jest.fn(),
  };

  const mockUserService = {
    findUsersByChatId: jest.fn(),
    getById: jest.fn(),
  };

  // 2. Мокаємо сам WebSocket сервер
  const mockServer = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Вимикаємо логи та помилки в консолі під час тестів, щоб не смітити в термінал
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Gateway, // Зверни увагу, клас називається Gateway
        { provide: GatewayService, useValue: mockGatewayService },
        { provide: ChatService, useValue: mockChatService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    gateway = module.get<Gateway>(Gateway);
    
    // Підставляємо наш фейковий сервер у шлюз
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('createChat', () => {
    it('should parse JSON and call chatService.create', () => {
      const chatData = { name: 'Test Chat', userIds: [1, 2] };
      mockChatService.create.mockReturnValue('created-chat');

      const result = gateway.createChat(JSON.stringify(chatData));

      expect(mockChatService.create).toHaveBeenCalledWith(chatData);
      expect(result).toBe('created-chat');
    });

    it('should catch error if JSON is invalid', () => {
      // Передаємо невалідний JSON
      gateway.createChat('invalid-json');

      expect(mockChatService.create).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled(); // Перевіряємо, що помилка відловилася
    });
  });

  describe('createMessage', () => {
    it('should create a message and emit it to the chat room', async () => {
      const messageData = { type: 'TEXT', chatId: 1, userId: 2, content: 'Hello' };
      const createdMessage = { id: 10, ...messageData };
      
      mockMessageService.create.mockResolvedValue(createdMessage);

      const result = await gateway.createMessage(messageData);

      expect(mockMessageService.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TEXT',
        chatId: 1,
        userId: 2,
        content: 'Hello',
      }));

      // Перевіряємо, що сервер відправив повідомлення у кімнату чату ('1')
      expect(mockServer.emit).toHaveBeenCalledWith('1', createdMessage);
      expect(result).toEqual(createdMessage);
    });
  });

  describe('startCall', () => {
    it('should fetch users, filter out caller, and emit CALL_REQUEST to others', async () => {
      const payload = { callId: 'call-123', callerId: 1, chatId: 10 };
      
      const mockUsers = [
        { id: 1, name: 'Caller' }, // Це той, хто дзвонить
        { id: 2, name: 'Receiver1' }, 
        { id: 3, name: 'Receiver2' }
      ];
      
      mockUserService.findUsersByChatId.mockResolvedValue(mockUsers);
      mockUserService.getById.mockResolvedValue(mockUsers[0]); // Повертаємо caller'а

      const result = await gateway.startCall(payload);

      expect(mockUserService.findUsersByChatId).toHaveBeenCalledWith(10);
      
      // Має відправити подію тільки 2-му і 3-му користувачу (без 1-го)
      expect(mockServer.emit).toHaveBeenCalledWith('call-user-2', expect.any(Object));
      expect(mockServer.emit).toHaveBeenCalledWith('call-user-3', expect.any(Object));
      expect(mockServer.emit).not.toHaveBeenCalledWith('call-user-1', expect.any(Object));

      expect(result).toEqual({ status: 'ok', callId: 'call-123' });
    });
  });

  // Базові CRUD методи
  describe('findAllGateway', () => {
    it('should call gatewayService.findAll', () => {
      mockGatewayService.findAll.mockReturnValue('all-gateways');
      expect(gateway.findAll()).toBe('all-gateways');
    });
  });

  describe('findOneGateway', () => {
    it('should call gatewayService.findOne', () => {
      mockGatewayService.findOne.mockReturnValue('one-gateway');
      expect(gateway.findOne(1)).toBe('one-gateway');
    });
  });

  describe('updateGateway', () => {
    it('should call gatewayService.update', () => {
      const dto = { id: 1, name: 'test' };
      mockGatewayService.update.mockReturnValue('updated');
      expect(gateway.update(dto as any)).toBe('updated');
      expect(mockGatewayService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('removeGateway', () => {
    it('should call gatewayService.remove', () => {
      mockGatewayService.remove.mockReturnValue('removed');
      expect(gateway.remove(1)).toBe('removed');
    });
  });
});