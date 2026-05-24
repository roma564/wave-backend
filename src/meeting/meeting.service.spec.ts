import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

describe('MeetingService', () => {
  let service: MeetingService;

  const mockUser: User = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    avatar: null,
  };

  const mockMeeting = {
    id: 1,
    title: 'Test Meeting',
    startDate: new Date('2026-05-24T12:00:00Z'),
    ownerId: 1,
    createdAt: new Date(),
    owner: mockUser,
    invited_users: [mockUser],
  };

  const mockPrisma = {
    meeting: {
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
        MeetingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meeting', async () => {
      mockPrisma.meeting.create.mockResolvedValue(mockMeeting);

      const dto = {
        title: 'Test Meeting',
        startDate: '2026-05-24T12:00:00Z',
        ownerId: 1,
        invitedUserIds: [1],
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockMeeting);
      expect(mockPrisma.meeting.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          startDate: new Date(dto.startDate),
          owner: { connect: { id: dto.ownerId } },
          invited_users: { connect: [{ id: 1 }] },
        },
        include: {
          owner: true,
          invited_users: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all meetings', async () => {
      mockPrisma.meeting.findMany.mockResolvedValue([mockMeeting]);

      const result = await service.findAll();

      expect(result).toEqual([mockMeeting]);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        include: { owner: true, invited_users: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return meeting by id', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMeeting);
      expect(mockPrisma.meeting.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { owner: true, invited_users: true },
      });
    });
  });

  describe('update', () => {
    it('should update meeting', async () => {
      const updatedMeeting = { ...mockMeeting, title: 'Updated Title' };
      mockPrisma.meeting.update.mockResolvedValue(updatedMeeting);

      const result = await service.update(1, { title: 'Updated Title' });

      expect(result).toEqual(updatedMeeting);
      
      // Перевіряємо, чи сервіс правильно підставляє undefined для полів, яких немає в DTO
      expect(mockPrisma.meeting.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated Title',
          startDate: undefined,
          ownerId: undefined,
          invited_users: undefined,
        },
        include: { owner: true, invited_users: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete meeting by id', async () => {
      mockPrisma.meeting.delete.mockResolvedValue(mockMeeting);

      await service.remove(1);

      expect(mockPrisma.meeting.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAllForUser', () => {
    it('should return all meetings for a user', async () => {
      mockPrisma.meeting.findMany.mockResolvedValue([mockMeeting]);

      const result = await service.findAllForUser(1);

      expect(result).toEqual([mockMeeting]);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ ownerId: 1 }, { invited_users: { some: { id: 1 } } }],
        },
        include: { owner: true, invited_users: true },
      });
    });
  });
});