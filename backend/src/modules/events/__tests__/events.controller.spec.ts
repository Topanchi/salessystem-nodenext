import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../events.controller';
import { EventsService } from '../events.service';
import { EventStatus, EventType } from '../../../common/enums';

describe('EventsController', () => {
  let controller: EventsController;
  let service: jest.Mocked<EventsService>;

  const mockClient = { id: 'c1', firstName: 'John', lastName: 'Doe' };
  const mockSeller = { id: 's1', email: 'seller@test.com', firstName: 'Jane', lastName: 'Seller' };

  const mockEvent = {
    id: 'event-123',
    clientId: 'c1',
    client: mockClient,
    sellerId: 's1',
    seller: mockSeller,
    name: 'Cumpleaños de María',
    type: EventType.CUMPLEANOS,
    eventDate: new Date('2024-06-15'),
    eventTime: new Date('1970-01-01T18:00:00'),
    location: 'Casa de la celebración',
    guestCount: 50,
    serviceDetails: 'Menú completo',
    observations: 'Cliente VIP',
    status: EventStatus.QUOTED,
    saleId: null,
    sale: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: '1', email: 'admin@test.com', firstName: 'Admin' },
    updatedBy: { id: '1', email: 'admin@test.com', firstName: 'Admin' },
    documents: [],
  };

  beforeEach(async () => {
    const mockEventsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      getUpcomingEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createDto = {
        clientId: 'c1',
        name: 'Cumpleaños de María',
        type: EventType.CUMPLEANOS,
        eventDate: '2024-06-15',
        eventTime: '18:00',
        location: 'Casa de la celebración',
        guestCount: 50,
      };
      service.create.mockResolvedValue(mockEvent);

      const result = await controller.create(createDto, 'user-1');

      expect(result).toEqual(mockEvent);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const paginatedResult = { data: [mockEvent], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10, EventStatus.QUOTED);

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      service.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne('event-123');

      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateDto = { location: 'Nueva ubicación' };
      service.update.mockResolvedValue({ ...mockEvent, ...updateDto });

      const result = await controller.update('event-123', updateDto, 'user-1');

      expect(result.location).toBe('Nueva ubicación');
    });
  });

  describe('updateStatus', () => {
    it('should update event status', async () => {
      const updateStatusDto = { status: EventStatus.CONFIRMED };
      service.updateStatus.mockResolvedValue({ ...mockEvent, status: EventStatus.CONFIRMED });

      const result = await controller.updateStatus('event-123', updateStatusDto);

      expect(result.status).toBe(EventStatus.CONFIRMED);
    });
  });

  describe('remove', () => {
    it('should cancel an event', async () => {
      service.remove.mockResolvedValue({ ...mockEvent, status: EventStatus.CANCELLED });

      const result = await controller.remove('event-123');

      expect(result.status).toBe(EventStatus.CANCELLED);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming events', async () => {
      service.getUpcomingEvents.mockResolvedValue([mockEvent]);

      const result = await controller.getUpcoming(5);

      expect(result).toEqual([mockEvent]);
    });
  });
});