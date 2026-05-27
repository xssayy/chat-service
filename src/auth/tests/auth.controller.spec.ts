import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('має повернути access_token при успішній реєстрації', async () => {
      // Arrange
      const dto = { username: 'testuser', password: 'password123' };
      const expected = { access_token: 'test-token' };
      (authService.register as jest.Mock).mockResolvedValue(expected);

      // Act
      const result = await controller.register(dto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('має повернути access_token при успішному вході', async () => {
      // Arrange
      const dto = { username: 'testuser', password: 'password123' };
      const expected = { access_token: 'test-token' };
      (authService.login as jest.Mock).mockResolvedValue(expected);

      // Act
      const result = await controller.login(dto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
