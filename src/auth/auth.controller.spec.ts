import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

// 1. Мокаємо зовнішню бібліотеку StreamClient, щоб вона не лізла в реальний API
jest.mock('@stream-io/node-sdk', () => {
  return {
    StreamClient: jest.fn().mockImplementation(() => ({
      createToken: jest.fn().mockReturnValue('mock-stream-token'),
    })),
  };
});

describe('AuthController', () => {
  let controller: AuthController;

  // Моки для сервісів
  const mockAuthService = {
    signIn: jest.fn(),
  };
  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  // Фейковий користувач для тестів
  const mockUser = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    avatar: 'avatar.jpg',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Задаємо фейкові змінні оточення для тестів
    process.env.JWT_SECRET = 'test-secret';
    process.env.STREAM_API_KEY = 'test-stream-key';
    process.env.STREAM_SECRET_KEY = 'test-stream-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('callbackGoogle', () => {
    it('should create new user if not exists and redirect', async () => {
      const mockReq = {
        user: { name: 'New', lastname: 'User', email: 'new@example.com', avatar: '' },
      };
      const mockRes = { redirect: jest.fn() } as unknown as Response;

      mockUserService.findByEmail.mockResolvedValue(null); // Користувача ще немає
      mockUserService.create.mockResolvedValue({ id: 2, ...mockReq.user });
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      await controller.callbackGoogle(mockReq, mockRes);

      expect(mockUserService.create).toHaveBeenCalledWith({
        name: 'New',
        lastname: 'User',
        email: 'new@example.com',
        avatar: '',
      });
      expect(mockRes.redirect).toHaveBeenCalled();
      
      // Перевіряємо, чи в URL є згенеровані токени
      const redirectUrl = (mockRes.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).toContain('access_token=mock-jwt-token');
      expect(redirectUrl).toContain('stream_token=mock-stream-token');
    });
  });

  describe('register', () => {
    it('should create user, generate tokens and return data', async () => {
      const registerDto = { name: 'John', lastname: 'Doe', email: 'john@example.com', password: 'pass' };
      
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await controller.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(result.tokens.access_token).toBe('mock-jwt-token');
      expect(result.tokens.stream_token).toBe('mock-stream-token');
      expect(result.user.username).toBe('John');
      expect(result.redirectUrl).toBe('http://localhost:3000/chat');
    });
  });

  describe('login', () => {
    it('should validate user, generate tokens and return data', async () => {
      const loginDto = { username: 'john@example.com', password: 'password123' };

      // authService.signIn повертає об'єкт { user: ... }
      mockAuthService.signIn.mockResolvedValue({ user: mockUser });
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await controller.login(loginDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith('john@example.com', 'password123');
      expect(result.tokens.access_token).toBe('mock-jwt-token');
      expect(result.tokens.stream_token).toBe('mock-stream-token');
      expect(result.user.username).toBe('John');
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const mockReq = { user: mockUser };
      const result = controller.getProfile(mockReq);
      
      expect(result).toEqual(mockUser);
    });
  });
});