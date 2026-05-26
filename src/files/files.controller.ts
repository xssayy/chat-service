import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Контролер для завантаження та отримання файлів.
 * Усі ендпоінти захищені JWT-автентифікацією.
 */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * POST /files/upload — завантаження файлу на сервер.
   * Приймає файл через multipart/form-data.
   * Використовує Multer для зберігання на диск у папку uploads/.
   * Підхід: API-first — структура відповіді фіксована, Multer реалізує її.
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
                         'application/pdf', 'text/plain'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Тип файлу ${file.mimetype} не підтримується`), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Файл не надано');
    const { file: saved, messageContent } = await this.filesService.saveFileMeta(
      file,
      req.user.id,
      req.user.username,
    );
    return {
      message: 'Файл успішно завантажено',
      filename: saved.filename,
      originalName: saved.originalName,
      mimetype: saved.mimetype,
      chatMessage: messageContent,
    };
  }

  /**
   * GET /files/:filename — отримання файлу за назвою (захищено JWT).
   */
  @Get(':filename')
  @UseGuards(JwtAuthGuard)
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.filesService.getFilePath(filename);
    res.sendFile(filePath);
  }
}
