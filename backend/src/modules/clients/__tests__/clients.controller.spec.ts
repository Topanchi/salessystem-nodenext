import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../clients.controller';
import { ClientsService } from '../clients.service';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: jest.Mocked<ClientsService>;

  const mockClient = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'Acme Corp',
    rut: '12345678-9',
    phone: '+56912345678',
    email: 'john@example.com',
    address: 'Test Address',
    notes: 'Test notes',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: '1', email: 'admin@test.com' },
    updatedBy: { id: '1', email: 'admin@test.com' },
  };

  beforeEach(async () => {
    const mockClientsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActiveClients: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: mockClientsService }],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const createDto = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
      service.create.mockResolvedValue(mockClient);

      const result = await controller.create(createDto, 'user-1');

      expect(result).toEqual(mockClient);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      const paginatedResult = { data: [mockClient], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10, 'search');

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      service.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockClient);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateDto = { firstName: 'Jane' };
      service.update.mockResolvedValue({ ...mockClient, ...updateDto });

      const result = await controller.update('123', updateDto, 'user-1');

      expect(result.firstName).toBe('Jane');
    });
  });

  describe('remove', () => {
    it('should soft delete a client', async () => {
      service.remove.mockResolvedValue(mockClient);

      const result = await controller.remove('123');

      expect(result).toEqual(mockClient);
    });
  });

  describe('findActive', () => {
    it('should return active clients', async () => {
      service.findActiveClients.mockResolvedValue([mockClient]);

      const result = await controller.findActive();

      expect(result).toEqual([mockClient]);
    });
  });
});