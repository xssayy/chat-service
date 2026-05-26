import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from './repositories/user.repository';

/**
 * Модуль автентифікації.
 * Налаштовує JWT, Passport та реєструє всі компоненти автентифікації.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRepository],
  exports: [JwtModule, UserRepository, PassportModule, JwtStrategy],
})
export class AuthModule {}
