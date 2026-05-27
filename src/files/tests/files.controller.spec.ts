import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from '../files.controller';
import { FilesService } from '../files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: Partial<FilesService>;

  beforeEach(async () => {
    filesService = {
      saveFileMeta: jest.fn(),
      getFilePath: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: filesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FilesController>(FilesController);
  });

  describe('uploadFile', () => {
    it('має повернути метадані після успішного завантаження файлу', async () => {
      // Arrange
      const mockFile = {
        filename: '123-test.png',
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;
      const mockReq = { user: { id: 1, username: 'testuser' } };
      const mockSaved = {
        id: 1,
        filename: '123-test.png',
        originalName: 'test.png',
        mimetype: 'image/png',
        ownerId: 1,
        createdAt: new Date(),
      };
      const mockMessageContent = '[Файл] test.png (/files/123-test.png)';
      (filesService.saveFileMeta as jest.Mock).mockResolvedValue({
        file: mockSaved,
        messageContent: mockMessageContent,
      });

      // Act
      const result = await controller.uploadFile(mockFile, mockReq);

      // Assert
      expect(filesService.saveFileMeta).toHaveBeenCalledWith(mockFile, 1, 'testuser');
      expect(result).toEqual({
        message: 'Файл успішно завантажено',
        filename: '123-test.png',
        originalName: 'test.png',
        mimetype: 'image/png',
        chatMessage: mockMessageContent,
      });
    });
  });

  describe('getFile', () => {
    it('має надіслати файл за назвою через res.sendFile', () => {
      // Arrange
      const filename = '123-test.png';
      const mockPath = '/absolute/path/uploads/123-test.png';
      const mockRes = { sendFile: jest.fn() } as any;
      (filesService.getFilePath as jest.Mock).mockReturnValue(mockPath);

      // Act
      controller.getFile(filename, mockRes);

      // Assert
      expect(filesService.getFilePath).toHaveBeenCalledWith(filename);
      expect(mockRes.sendFile).toHaveBeenCalledWith(mockPath);
    });
  });
});
