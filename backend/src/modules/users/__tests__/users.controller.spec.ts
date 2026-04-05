import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roleId: 'role-1',
    role: { id: 'role-1', name: 'ADMIN', createdAt: new Date() },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { email: 'test@example.com', password: 'password123', roleId: 'role-1' };
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = { data: [mockUser], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw if user not found', async () => {
      service.findOne.mockRejectedValue(new Error('User not found'));

      await expect(controller.findOne('999')).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'Updated' };
      service.update.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

      const result = await controller.update('123', updateDto);

      expect(result.firstName).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      service.remove.mockResolvedValue(mockUser);

      const result = await controller.remove('123');

      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});