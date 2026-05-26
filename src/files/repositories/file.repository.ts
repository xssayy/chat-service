import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';

/**
 * Репозиторій для роботи з метаданими файлів у базі даних.
 * Зберігає інформацію про завантажені файли: назву, тип, власника.
 */
@Injectable()
export class FileRepository {
  private readonly logger = new Logger(FileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Зберігає метадані завантаженого файлу.
   * @param filename - назва файлу на диску
   * @param originalName - оригінальна назва файлу
   * @param mimetype - MIME-тип файлу
   * @param ownerId - ідентифікатор власника
   */
  async create(
    filename: string,
    originalName: string,
    mimetype: string,
    ownerId: number,
  ): Promise<File> {
    this.logger.log(`Збереження метаданих файлу: ${originalName} (власник id=${ownerId})`);
    return this.prisma.file.create({
      data: { filename, originalName, mimetype, ownerId },
    });
  }

}
