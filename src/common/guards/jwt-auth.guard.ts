import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для захисту HTTP-ендпоінтів за допомогою JWT-автентифікації.
 * Використовує стратегію 'jwt' (JwtStrategy) для перевірки токена.
 * Якщо токен невалідний або відсутній — повертає 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
