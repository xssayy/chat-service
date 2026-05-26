import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Кореневий модуль застосунку.
 * Імпортує всі функціональні модулі: автентифікацію, чат, файли та базу даних.
 */
@Module({
  imports: [PrismaModule, AuthModule, ChatModule, FilesModule],
})
export class AppModule {}
