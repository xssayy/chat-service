import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для входу користувача.
 */
export class LoginDto {
  @ApiProperty({ example: 'john_doe', description: "Ім'я користувача" })
  @IsString()
  username: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль користувача' })
  @IsString()
  password: string;
}
