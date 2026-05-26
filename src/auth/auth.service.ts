import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Сервіс автентифікації.
 * Реалізує логіку реєстрації, входу та генерації JWT-токенів.
 * Виступає фасадом над UserRepository та JwtService.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Реєструє нового користувача.
   * Перевіряє унікальність імені та хешує пароль перед збереженням.
   * @param dto - дані для реєстрації
   * @returns JWT-токен доступу
   */
  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    this.logger.log(`Спроба реєстрації: ${dto.username}`);

    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      this.logger.warn(`Реєстрація відхилена — користувач вже існує: ${dto.username}`);
      throw new ConflictException('Користувач з таким іменем вже існує');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create(dto.username, hashedPassword);

    this.logger.log(`Користувача зареєстровано успішно: ${user.username} (id=${user.id})`);
    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return { access_token: token };
  }

  /**
   * Виконує вхід користувача.
   * Перевіряє наявність акаунту та правильність пароля.
   * @param dto - облікові дані для входу
   * @returns JWT-токен доступу
   */
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    this.logger.log(`Спроба входу: ${dto.username}`);

    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      this.logger.warn(`Вхід відхилено — користувач не знайдений: ${dto.username}`);
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Вхід відхилено — невірний пароль для: ${dto.username}`);
      throw new UnauthorizedException('Невірні облікові дані');
    }

    this.logger.log(`Успішний вхід: ${user.username} (id=${user.id})`);
    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return { access_token: token };
  }
}
