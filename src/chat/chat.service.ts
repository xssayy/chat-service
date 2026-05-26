import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from './repositories/message.repository';

/**
 * Сервіс чату.
 * Обробляє бізнес-логіку обміну повідомленнями.
 * Виступає фасадом над MessageRepository.
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  /**
   * Зберігає повідомлення та повертає його з даними автора.
   * @param content - текст повідомлення
   * @param authorId - ідентифікатор автора
   */
  async saveMessage(content: string, authorId: number) {
    this.logger.log(`Збереження повідомлення від userId=${authorId}`);
    return this.messageRepository.create(content, authorId);
  }

  /**
   * Повертає останні повідомлення для новопідключеного клієнта.
   */
  async getRecentMessages() {
    return this.messageRepository.findRecent(50);
  }
}
