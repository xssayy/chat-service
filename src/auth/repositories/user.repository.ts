import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * Репозиторій для роботи з користувачами в базі даних.
 * Інкапсулює всі операції з таблицею User через Prisma Client.
 */
@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    this.logger.log(`Пошук користувача: ${username}`);
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(username: string, hashedPassword: string): Promise<User> {
    this.logger.log(`Створення нового користувача: ${username}`);
    return this.prisma.user.create({
      data: { username, password: hashedPassword },
    });
  }
}
