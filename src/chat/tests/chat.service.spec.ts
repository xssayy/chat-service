import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../chat.service';
import { MessageRepository } from '../repositories/message.repository';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepository: Partial<MessageRepository>;

  beforeEach(async () => {
    messageRepository = {
      create: jest.fn(),
      findRecent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: MessageRepository, useValue: messageRepository },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('saveMessage має зберігати повідомлення через репозиторій', async () => {
    const mockMessage = { id: 1, content: 'Hello', authorId: 1, createdAt: new Date() };
    (messageRepository.create as jest.Mock).mockResolvedValue(mockMessage);

    const result = await service.saveMessage('Hello', 1);
    expect(messageRepository.create).toHaveBeenCalledWith('Hello', 1);
    expect(result).toEqual(mockMessage);
  });

  it('getRecentMessages має повертати список повідомлень', async () => {
    const mockMessages = [
      { id: 1, content: 'Hello', authorId: 1, createdAt: new Date(), author: { username: 'user1' } },
    ];
    (messageRepository.findRecent as jest.Mock).mockResolvedValue(mockMessages);

    const result = await service.getRecentMessages();
    expect(result).toEqual(mockMessages);
  });
});
