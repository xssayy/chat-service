import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO для реєстрації нового користувача.
 */
export class RegisterDto {
  @IsString()
  @MinLength(3, { message: "Ім'я користувача має містити мінімум 3 символи" })
  @MaxLength(20, { message: "Ім'я користувача має містити максимум 20 символів" })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;
}
