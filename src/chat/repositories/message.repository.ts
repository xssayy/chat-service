import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Message } from '@prisma/client';

/**
 * Репозиторій для роботи з повідомленнями в базі даних.
 * Інкапсулює CRUD-операції для таблиці Message.
 */
@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Зберігає нове повідомлення в базі даних.
   * @param content - текст повідомлення
   * @param authorId - ідентифікатор автора
   */
  async create(content: string, authorId: number): Promise<Message> {
    this.logger.log(`Збереження повідомлення від користувача id=${authorId}`);
    return this.prisma.message.create({
      data: { content, authorId },
    });
  }

  /**
   * Повертає останні N повідомлень для відображення історії чату.
   * @param limit - кількість повідомлень (за замовчуванням 50)
   */
  async findRecent(limit = 50): Promise<(Message & { author: { username: string } })[]> {
    return this.prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { username: true } } },
    }) as any;
  }
}
