import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './types/User'; 
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    avatar: null,
  };

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findByUsername: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as any;
    jwtService = module.get(JwtService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      // Додали as any, щоб TS не сварився на типи
      userService.findByUsername.mockResolvedValue(mockUser as any);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser('john@example.com', 'password123');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      // Додали as any
      userService.findByUsername.mockResolvedValue(mockUser as any);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false as any);

      const result = await service.validateUser('john@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should return access token and user on successful login', async () => {
      // Повертаємо нашого юзера
      userService.findByUsername.mockResolvedValue(mockUser as any);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      // ТУТ ЗМІНА: передаємо 'hashedpassword', щоб він збігся з mockUser.password
      const result = await service.signIn('john@example.com', 'hashedpassword');

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findByUsername.mockResolvedValue(null);

      await expect(service.signIn('unknown', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      // Тут була забута дужка ) в кінці рядка, тепер виправлено:
      userService.findByUsername.mockResolvedValue({ ...mockUser, password: 'differentpassword' } as any);

      await expect(service.signIn('john@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});