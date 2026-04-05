import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockLoginResponse = {
    accessToken: 'mock-token',
    user: {
      id: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      service.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw on invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrong' };
      service.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = { id: '123', email: 'test@example.com', role: 'ADMIN' };
      service.validateUser.mockResolvedValue(mockUser);

      const result = await controller.getProfile({ id: '123', email: 'test@example.com', role: 'ADMIN' });

      expect(result).toEqual(mockUser);
    });
  });
});