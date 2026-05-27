import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Контролер автентифікації.
 * Обробляє HTTP-запити для реєстрації та входу користувачів.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register — реєстрація нового користувача.
   * @param dto - { username, password }
   * @returns { access_token }
   */
  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувача створено, повертає access_token', schema: { example: { access_token: 'eyJhbGci...' } } })
  @ApiResponse({ status: 400, description: 'Помилка валідації або ім\'я вже зайняте' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login — вхід користувача.
   * @param dto - { username, password }
   * @returns { access_token }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вхід користувача' })
  @ApiResponse({ status: 200, description: 'Успішний вхід, повертає access_token', schema: { example: { access_token: 'eyJhbGci...' } } })
  @ApiResponse({ status: 401, description: 'Невірний логін або пароль' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
