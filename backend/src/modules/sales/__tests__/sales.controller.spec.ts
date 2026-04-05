import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from '../sales.controller';
import { SalesService } from '../sales.service';
import { SaleStatus } from '../../../common/enums';

describe('SalesController', () => {
  let controller: SalesController;
  let service: jest.Mocked<SalesService>;

  const mockClient = { id: 'c1', firstName: 'John', lastName: 'Doe' };
  const mockSeller = { id: 's1', email: 'seller@test.com', firstName: 'Jane', lastName: 'Seller' };
  
  const mockSale = {
    id: 'sale-123',
    clientId: 'c1',
    client: mockClient,
    sellerId: 's1',
    seller: mockSeller,
    status: SaleStatus.PENDING,
    subtotal: 50000,
    discountAmount: 5000,
    total: 45000,
    notes: 'Test sale',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: '1', email: 'admin@test.com', firstName: 'Admin' },
    updatedBy: { id: '1', email: 'admin@test.com', firstName: 'Admin' },
    items: [
      {
        id: 'item-1',
        saleId: 'sale-123',
        productId: 'p1',
        product: { id: 'p1', name: 'Torta', category: 'TORTA', basePrice: 25000, active: true },
        description: 'Torta de chocolate',
        quantity: 2,
        unitPrice: 25000,
        subtotal: 50000,
        observation: null,
      },
    ],
  };

  beforeEach(async () => {
    const mockSalesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: mockSalesService }],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    service = module.get(SalesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a sale', async () => {
      const createDto = {
        clientId: 'c1',
        items: [{ productId: 'p1', quantity: 2, unitPrice: 25000 }],
        discountAmount: 5000,
      };
      service.create.mockResolvedValue(mockSale);

      const result = await controller.create(createDto, 'user-1');

      expect(result).toEqual(mockSale);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated sales', async () => {
      const paginatedResult = { data: [mockSale], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10, SaleStatus.PENDING);

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a sale by id', async () => {
      service.findOne.mockResolvedValue(mockSale);

      const result = await controller.findOne('sale-123');

      expect(result).toEqual(mockSale);
    });
  });

  describe('update', () => {
    it('should update a sale', async () => {
      const updateDto = { notes: 'Updated notes' };
      service.update.mockResolvedValue({ ...mockSale, ...updateDto });

      const result = await controller.update('sale-123', updateDto, 'user-1');

      expect(result.notes).toBe('Updated notes');
    });
  });

  describe('updateStatus', () => {
    it('should update sale status', async () => {
      const updateStatusDto = { status: SaleStatus.CONFIRMED };
      service.updateStatus.mockResolvedValue({ ...mockSale, status: SaleStatus.CONFIRMED });

      const result = await controller.updateStatus('sale-123', updateStatusDto);

      expect(result.status).toBe(SaleStatus.CONFIRMED);
    });
  });

  describe('remove', () => {
    it('should cancel a sale', async () => {
      service.remove.mockResolvedValue({ ...mockSale, status: SaleStatus.CANCELLED });

      const result = await controller.remove('sale-123');

      expect(result.status).toBe(SaleStatus.CANCELLED);
    });
  });
});