import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { ProductCategory } from '../../../common/enums';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct = {
    id: '123',
    name: 'Torta de Chocolate',
    category: ProductCategory.TORTA,
    description: 'Delicious chocolate cake',
    basePrice: 25000,
    active: true,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: '1', email: 'admin@test.com' },
    updatedBy: { id: '1', email: 'admin@test.com' },
  };

  beforeEach(async () => {
    const mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActiveProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = { name: 'Torta de Chocolate', category: ProductCategory.TORTA, basePrice: 25000 };
      service.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto, 'user-1');

      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginatedResult = { data: [mockProduct], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10, ProductCategory.TORTA, 'search');

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      service.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { basePrice: 28000 };
      service.update.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await controller.update('123', updateDto, 'user-1');

      expect(result.basePrice).toBe(28000);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      service.remove.mockResolvedValue(mockProduct);

      const result = await controller.remove('123');

      expect(result).toEqual(mockProduct);
    });
  });
});