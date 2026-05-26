import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileRepository } from './repositories/file.repository';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';

/**
 * Модуль для роботи з файлами.
 * Реєструє контролер, сервіс та репозиторій для завантаження й зберігання файлів.
 */
@Module({
  imports: [AuthModule, ChatModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository],
})
export class FilesModule {}
