import { IsString } from 'class-validator';

/**
 * DTO для входу користувача.
 */
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
