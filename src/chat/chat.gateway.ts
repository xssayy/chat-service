import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Message } from '@prisma/client';
import { ChatService } from './chat.service';
import { UserRepository } from '../auth/repositories/user.repository';
import { CHAT_ROOM } from './chat.constants';

/**
 * WebSocket-шлюз для обміну повідомленнями в реальному часі.
 * Використовує Socket.IO для організації двостороннього зв'язку між клієнтами.
 * Реалізує патерн Спостерігач: клієнти підписуються на події сервера.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  /** Зберігає відповідність socketId → username для логування */
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Транслює подію всім клієнтам у кімнаті чату.
   */
  private broadcastToChat(event: string, payload: unknown) {
    this.server.to(CHAT_ROOM).emit(event, payload);
  }

  /**
   * Сповіщає клієнтів про нове текстове повідомлення в історії чату.
   */
  broadcastNewMessage(message: Message, username: string) {
    this.broadcastToChat('newMessage', {
      id: message.id,
      content: message.content,
      author: { username },
      createdAt: message.createdAt,
    });
  }

  /**
   * Сповіщає клієнтів про завантаження файлу (подія fileUploaded).
   */
  broadcastFileUploaded(payload: {
    id: number;
    filename: string;
    originalName: string;
    mimetype: string;
    owner: { username: string };
    messageId: number;
    createdAt: Date;
  }) {
    this.broadcastToChat('fileUploaded', payload);
  }

  /**
   * Обробник підключення нового клієнта.
   * Перевіряє JWT-токен з параметрів підключення.
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Токен не надано');

      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Користувача не знайдено');

      await client.join(CHAT_ROOM);

      this.connectedUsers.set(client.id, user.username);
      client.data.userId = user.id;
      client.data.username = user.username;

      this.logger.log(`Клієнт підключився: ${user.username} (socketId=${client.id})`);

      const history = await this.chatService.getRecentMessages();
      client.emit('history', history.reverse());

      this.broadcastToChat('userJoined', { username: user.username });
    } catch (error) {
      this.logger.warn(`Відхилено підключення: ${client.id} — ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Обробник відключення клієнта.
   */
  handleDisconnect(client: Socket) {
    const username = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    this.logger.log(`Клієнт відключився: ${username || client.id}`);
    if (username) {
      this.broadcastToChat('userLeft', { username });
    }
  }

  /**
   * Обробник події sendMessage від клієнта.
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, username } = client.data;

    if (!userId || !payload?.content?.trim()) return;

    this.logger.log(`Повідомлення від ${username}: "${payload.content.substring(0, 50)}"`);

    const message = await this.chatService.saveMessage(payload.content, userId);
    this.broadcastNewMessage(message, username);
  }
}
