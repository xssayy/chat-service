import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../files.service';
import { FileRepository } from '../repositories/file.repository';
import { ChatService } from '../../chat/chat.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { NotFoundException } from '@nestjs/common';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: Partial<FileRepository>;
  let chatService: Partial<ChatService>;
  let chatGateway: Partial<ChatGateway>;

  beforeEach(async () => {
    fileRepository = {
      create: jest.fn(),
    };
    chatService = {
      saveMessage: jest.fn(),
    };
    chatGateway = {
      broadcastNewMessage: jest.fn(),
      broadcastFileUploaded: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: FileRepository, useValue: fileRepository },
        { provide: ChatService, useValue: chatService },
        { provide: ChatGateway, useValue: chatGateway },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('saveFileMeta має зберігати метадані файлу та створювати повідомлення в чаті', async () => {
    const mockFile = {
      filename: '123-test.jpg',
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    const mockSaved = {
      id: 1,
      filename: '123-test.jpg',
      originalName: 'test.jpg',
      mimetype: 'image/jpeg',
      ownerId: 1,
      createdAt: new Date(),
    };
    const mockMessage = {
      id: 10,
      content: '[Файл] test.jpg (/files/123-test.jpg)',
      authorId: 1,
      createdAt: new Date(),
    };

    (fileRepository.create as jest.Mock).mockResolvedValue(mockSaved);
    (chatService.saveMessage as jest.Mock).mockResolvedValue(mockMessage);

    const result = await service.saveFileMeta(mockFile, 1, 'testuser');

    expect(fileRepository.create).toHaveBeenCalledWith(
      '123-test.jpg',
      'test.jpg',
      'image/jpeg',
      1,
    );
    expect(chatService.saveMessage).toHaveBeenCalledWith(
      '[Файл] test.jpg (/files/123-test.jpg)',
      1,
    );
    expect(chatGateway.broadcastNewMessage).toHaveBeenCalledWith(mockMessage, 'testuser');
    expect(chatGateway.broadcastFileUploaded).toHaveBeenCalled();
    expect(result.file).toEqual(mockSaved);
    expect(result.messageContent).toContain('test.jpg');
  });

  it('getFilePath має кинути NotFoundException для неіснуючого файлу', () => {
    expect(() => service.getFilePath('nonexistent.jpg')).toThrow(NotFoundException);
  });
});
