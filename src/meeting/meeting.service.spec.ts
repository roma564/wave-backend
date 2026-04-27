import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { PrismaService } from '../prisma.service';
import { Meeting, User } from '@prisma/client';

describe('MeetingService', () => {
  let service: MeetingService;
  let prismaService: jest.Mocked<PrismaService>;

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

  const mockMeeting: Meeting & { owner: User; invited_users: User[] } = {
    id: 1,
    title: 'Test Meeting',
    startDate: new Date(),
    ownerId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: mockUser,
    invited_users: [mockUser],
  };

  beforeEach(async () => {
    const mockPrisma = {
      meeting: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meeting', async () => {
      prismaService.meeting.create.mockResolvedValue(mockMeeting);

      const result = await service.create({
        title: 'Test Meeting',
        startDate: new Date().toISOString(),
        ownerId: 1,
        invitedUserIds: [1],
      });

      expect(result).toEqual(mockMeeting);
    });
  });

  describe('findAll', () => {
    it('should return all meetings', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockMeeting]);

      const result = await service.findAll();

      expect(result).toEqual([mockMeeting]);
    });
  });

  describe('findOne', () => {
    it('should return meeting by id', async () => {
      prismaService.meeting.findUnique.mockResolvedValue(mockMeeting);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMeeting);
    });
  });

  describe('update', () => {
    it('should update meeting', async () => {
      const updatedMeeting = { ...mockMeeting, title: 'Updated Title' };
      prismaService.meeting.update.mockResolvedValue(updatedMeeting);

      const result = await service.update(1, { title: 'Updated Title' });

      expect(result).toEqual(updatedMeeting);
    });
  });

  describe('remove', () => {
    it('should delete meeting by id', async () => {
      prismaService.meeting.delete.mockResolvedValue(mockMeeting);

      await service.remove(1);

      expect(prismaService.meeting.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAllForUser', () => {
    it('should return all meetings for a user', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockMeeting]);

      const result = await service.findAllForUser(1);

      expect(result).toEqual([mockMeeting]);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ ownerId: 1 }, { invited_users: { some: { id: 1 } } }],
        },
        include: { owner: true, invited_users: true },
      });
    });
  });
});
