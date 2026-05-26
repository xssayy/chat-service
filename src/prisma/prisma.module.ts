import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Глобальний модуль бази даних.
 * Декоратор @Global() дозволяє використовувати PrismaService у всіх модулях
 * без явного імпорту PrismaModule.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
