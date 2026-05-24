import { Test, TestingModule } from '@nestjs/testing';
import { ModeService } from './mode.service';
import { PrismaService } from '../prisma.service';
import { ThemeName } from '@prisma/client';

describe('ModeService', () => {
  let service: ModeService;

  const mockPrisma = {
    mode: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockMode = {
    id: 1,
    name: 'Work Mode',
    theme: ThemeName.BLUE,
    scheduledCallMode: false,
    stickers: true,
    restrictedSmileMode: false,
    quickMessages: [],
    userId: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ModeService>(ModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserModes', () => {
    it('should return modes for a specific user', async () => {
      mockPrisma.mode.findMany.mockResolvedValue([mockMode]);
      const result = await service.getUserModes(1);
      expect(result).toEqual([mockMode]);
    });
  });

  describe('createModeForUser', () => {
    it('should create a mode for user', async () => {
      mockPrisma.mode.create.mockResolvedValue(mockMode);
      const dto = { name: 'Work Mode', theme: ThemeName.BLUE };
      const result = await service.createModeForUser(1, dto as any);
      expect(result).toEqual(mockMode);
    });
  });

  describe('addChatToMode', () => {
    it('should connect a chat to a mode', async () => {
      mockPrisma.mode.update.mockResolvedValue(mockMode);
      const result = await service.addChatToMode(1, 100);
      expect(result).toEqual(mockMode);
    });
  });

  describe('getChatsByMode', () => {
    it('should return a mode with its chats', async () => {
      mockPrisma.mode.findUnique.mockResolvedValue(mockMode);
      const result = await service.getChatsByMode(1);
      expect(result).toEqual(mockMode);
    });
  });

  describe('getQuickMessages', () => {
    it('should return only quick messages for a mode', async () => {
      mockPrisma.mode.findUnique.mockResolvedValue({ quickMessages: [] });
      const result = await service.getQuickMessages(1);
      expect(result).toEqual({ quickMessages: [] });
    });
  });

  describe('updateQuickMessages', () => {
    it('should push new messages to mode', async () => {
      mockPrisma.mode.update.mockResolvedValue({ quickMessages: ['BRB'] });
      const result = await service.updateQuickMessages(1, ['BRB']);
      expect(result).toEqual({ quickMessages: ['BRB'] });
    });
  });

  describe('setTheme', () => {
    it('should update theme of a mode', async () => {
      mockPrisma.mode.update.mockResolvedValue(mockMode);
      const result = await service.setTheme(1, ThemeName.PURPLE);
      expect(result).toEqual(mockMode);
    });
  });
});