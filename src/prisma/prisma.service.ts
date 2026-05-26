import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Сервіс для роботи з базою даних через Prisma ORM.
 * Реалізує підключення до PostgreSQL та коректне відключення при завершенні роботи.
 * Є глобальним провайдером — ін'єктується у всі репозиторії.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Підключення до бази даних встановлено');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Підключення до бази даних закрито');
  }
}
