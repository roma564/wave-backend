import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  // 1. Створюємо мок для UserService
  const mockUserService = {
    create: jest.fn(),
    getById: jest.fn(),
    findAll: jest.fn(),
    findUsersByChatId: jest.fn(), // Додано для нового методу
    remove: jest.fn(),
    updateAvatar: jest.fn(),
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
    // Очищаємо моки перед кожним тестом, щоб вони не перетиналися
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService, // Підміняємо справжній сервіс на наш мок
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserService.create.mockResolvedValue(mockUser);

      const createDto = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
      };

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should get all users', async () => {
      mockUserService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should get a user by id', async () => {
      mockUserService.getById.mockResolvedValue(mockUser);

      // Контролер приймає рядок '1' і має перетворити його на число 1 (+id)
      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(mockUserService.getById).toHaveBeenCalledWith(1); 
    });
  });

  describe('findUsersByChat', () => {
    it('should get users by chat id', async () => {
      mockUserService.findUsersByChatId.mockResolvedValue([mockUser]);

      const result = await controller.findUsersByChat('10');

      expect(result).toEqual([mockUser]);
      expect(mockUserService.findUsersByChatId).toHaveBeenCalledWith(10);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar successfully', async () => {
      mockUserService.updateAvatar.mockResolvedValue({ ...mockUser, avatar: 'https://new-avatar.url' });

      // Зверни увагу: у контролері id не перетворюється на число (+id), тому очікуємо рядок '1'
      const result = await controller.updateAvatar('1', 'https://new-avatar.url');

      expect(result).toEqual({ ...mockUser, avatar: 'https://new-avatar.url' });
      expect(mockUserService.updateAvatar).toHaveBeenCalledWith('1', 'https://new-avatar.url');
    });

    it('should throw BadRequestException if avatarUrl is missing', async () => {
      await expect(controller.updateAvatar('1', '')).rejects.toThrow(BadRequestException);
      expect(mockUserService.updateAvatar).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockUserService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove('1');

      expect(result).toEqual(mockUser);
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });
  });
});