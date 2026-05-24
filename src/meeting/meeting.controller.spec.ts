import { Test, TestingModule } from '@nestjs/testing';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

describe('MeetingController', () => {
  let controller: MeetingController;

  // 1. Створюємо мок для MeetingService
  const mockMeetingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllForUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockMeeting = {
    id: 1,
    title: 'Daily Standup',
    startDate: new Date(),
    ownerId: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingController],
      providers: [
        { provide: MeetingService, useValue: mockMeetingService },
      ],
    }).compile();

    controller = module.get<MeetingController>(MeetingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call meetingService.create', async () => {
      mockMeetingService.create.mockResolvedValue(mockMeeting);
      
      const dto = { title: 'Daily Standup', startDate: new Date().toISOString(), ownerId: 1 };
      
      const result = await controller.create(dto as any);

      expect(mockMeetingService.create).toHaveBeenCalledWith(dto);
      // Оскільки в контролері зараз закоментовано "return meeting;", result буде undefined
      // Коли ти розкоментуєш return, можеш додати: expect(result).toEqual(mockMeeting);
    });
  });

  describe('findAll', () => {
    it('should return an array of meetings', () => {
      mockMeetingService.findAll.mockReturnValue([mockMeeting]);
      
      expect(controller.findAll()).toEqual([mockMeeting]);
      expect(mockMeetingService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single meeting by id', () => {
      mockMeetingService.findOne.mockReturnValue(mockMeeting);
      
      const result = controller.findOne('1');
      
      expect(result).toEqual(mockMeeting);
      // Перевіряємо, що рядок '1' перетворився на число 1
      expect(mockMeetingService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findAllForUser', () => {
    it('should return meetings for a specific user', () => {
      mockMeetingService.findAllForUser.mockReturnValue([mockMeeting]);
      
      const result = controller.findAllForUser('1');
      
      expect(result).toEqual([mockMeeting]);
      expect(mockMeetingService.findAllForUser).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a meeting', () => {
      const dto = { title: 'Updated Title' };
      const updatedMeeting = { ...mockMeeting, ...dto };
      mockMeetingService.update.mockReturnValue(updatedMeeting);
      
      const result = controller.update('1', dto as any);
      
      expect(result).toEqual(updatedMeeting);
      expect(mockMeetingService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a meeting', () => {
      mockMeetingService.remove.mockReturnValue(mockMeeting);
      
      const result = controller.remove('1');
      
      expect(result).toEqual(mockMeeting);
      expect(mockMeetingService.remove).toHaveBeenCalledWith(1);
    });
  });
});