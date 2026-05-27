import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для реєстрації нового користувача.
 */
export class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: "Ім'я користувача (3–20 символів)", minLength: 3, maxLength: 20 })
  @IsString()
  @MinLength(3, { message: "Ім'я користувача має містити мінімум 3 символи" })
  @MaxLength(20, { message: "Ім'я користувача має містити максимум 20 символів" })
  username: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль (мінімум 6 символів)', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;
}
