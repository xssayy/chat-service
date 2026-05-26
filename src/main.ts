import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Точка входу застосунку.
 * Ініціалізує NestJS-сервер, налаштовує глобальні middleware та запускає прослуховування порту.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Глобальний фільтр виключень — обробляє всі HTTP-помилки
  app.useGlobalFilters(new HttpExceptionFilter());

  // Глобальна валідація вхідних DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Дозволяємо CORS для майбутнього фронтенду
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Сервер запущено на порті ${port}`);
}

bootstrap();
