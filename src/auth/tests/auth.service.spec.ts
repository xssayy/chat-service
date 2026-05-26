import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Partial<UserRepository>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    userRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('має повернути access_token при успішній реєстрації', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 1, username: 'testuser', password: 'hashed', createdAt: new Date(),
      });

      const result = await service.register({ username: 'testuser', password: 'password123' });
      expect(result).toHaveProperty('access_token', 'test-token');
    });

    it('має кинути ConflictException якщо користувач вже існує', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });

      await expect(
        service.register({ username: 'testuser', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('має повернути access_token при правильних облікових даних', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1, username: 'testuser', password: hashedPassword,
      });

      const result = await service.login({ username: 'testuser', password: 'password123' });
      expect(result).toHaveProperty('access_token', 'test-token');
    });

    it('має кинути UnauthorizedException при невірному паролі', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1, username: 'testuser', password: hashedPassword,
      });

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('має кинути UnauthorizedException якщо користувач не знайдений', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
