import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { File } from '@prisma/client';
import { FileRepository } from './repositories/file.repository';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Сервіс для роботи з файлами.
 * Зберігає метадані у БД, файли на диску та додає запис у історію чату (MessageRepository).
 */
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsPath = path.join(process.cwd(), 'uploads');

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Зберігає метадані файлу, створює повідомлення в чаті та сповіщає клієнтів через WebSocket.
   */
  async saveFileMeta(
    file: Express.Multer.File,
    ownerId: number,
    username: string,
  ): Promise<{ file: File; messageContent: string }> {
    this.logger.log(
      `Завантажено файл: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    const saved = await this.fileRepository.create(
      file.filename,
      file.originalname,
      file.mimetype,
      ownerId,
    );

    const messageContent = `[Файл] ${file.originalname} (/files/${file.filename})`;
    const message = await this.chatService.saveMessage(messageContent, ownerId);

    this.chatGateway.broadcastNewMessage(message, username);
    this.chatGateway.broadcastFileUploaded({
      id: saved.id,
      filename: saved.filename,
      originalName: saved.originalName,
      mimetype: saved.mimetype,
      owner: { username },
      messageId: message.id,
      createdAt: saved.createdAt,
    });

    this.logger.log(
      `Файл ${saved.originalName} додано до історії чату (messageId=${message.id})`,
    );

    return { file: saved, messageContent };
  }

  /**
   * Повертає повний шлях до файлу на диску.
   */
  getFilePath(filename: string): string {
    const filePath = path.join(this.uploadsPath, filename);
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`Файл не знайдено: ${filename}`);
      throw new NotFoundException(`Файл ${filename} не знайдено`);
    }
    return filePath;
  }

}
