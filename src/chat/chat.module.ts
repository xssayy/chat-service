import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageRepository } from './repositories/message.repository';
import { AuthModule } from '../auth/auth.module';

/**
 * Модуль чату.
 * Реєструє WebSocket-шлюз та сервіс для обміну повідомленнями.
 * Імпортує AuthModule для доступу до JwtService та UserRepository.
 */
@Module({
  imports: [AuthModule],
  providers: [ChatGateway, ChatService, MessageRepository],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
