import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from './gateway.service';

describe('GatewayService', () => {
  let service: GatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayService],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return string confirming creation', () => {
      const dto = { name: 'Test Gateway' }; // Фейковий DTO
      expect(service.create(dto as any)).toBe('This action adds a new gateway');
    });
  });

  describe('findAll', () => {
    it('should return string for all gateways', () => {
      expect(service.findAll()).toBe('This action returns all gateway');
    });
  });

  describe('findOne', () => {
    it('should return string for a specific gateway by id', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 gateway');
      expect(service.findOne(99)).toBe('This action returns a #99 gateway');
    });
  });

  describe('update', () => {
    it('should return string confirming update', () => {
      const dto = { name: 'Updated Gateway' };
      expect(service.update(1, dto as any)).toBe('This action updates a #1 gateway');
    });
  });

  describe('remove', () => {
    it('should return string confirming removal', () => {
      expect(service.remove(1)).toBe('This action removes a #1 gateway');
    });
  });
});