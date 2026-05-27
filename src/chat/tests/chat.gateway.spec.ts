import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../chat.service';
import { UserRepository } from '../../auth/repositories/user.repository';
import { CHAT_ROOM } from '../chat.constants';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: Partial<ChatService>;
  let jwtService: Partial<JwtService>;
  let userRepository: Partial<UserRepository>;
  let mockServer: any;

  beforeEach(async () => {
    chatService = {
      saveMessage: jest.fn(),
      getRecentMessages: jest.fn(),
    };
    jwtService = {
      verify: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
    };
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: chatService },
        { provide: JwtService, useValue: jwtService },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = mockServer;
  });

  describe('handleConnection', () => {
    it('має успішно підключити клієнта з валідним JWT', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'testuser' };
      const mockHistory = [
        { id: 1, content: 'Hello', authorId: 1, createdAt: new Date() },
      ];
      const mockClient: any = {
        id: 'socket-id-1',
        handshake: { auth: { token: 'valid-token' }, headers: {} },
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        data: {},
      };
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1 });
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (chatService.getRecentMessages as jest.Mock).mockResolvedValue(mockHistory);

      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(mockClient.join).toHaveBeenCalledWith(CHAT_ROOM);
      expect(mockClient.data.userId).toBe(1);
      expect(mockClient.data.username).toBe('testuser');
      expect(mockClient.emit).toHaveBeenCalledWith('history', expect.any(Array));
    });
  });

  describe('handleDisconnect', () => {
    it('має видалити користувача зі списку та розіслати подію userLeft', () => {
      // Arrange
      const mockClient: any = { id: 'socket-id-1', data: {} };
      (gateway as any).connectedUsers.set('socket-id-1', 'testuser');

      // Act
      gateway.handleDisconnect(mockClient);

      // Assert
      expect((gateway as any).connectedUsers.has('socket-id-1')).toBe(false);
      expect(mockServer.to).toHaveBeenCalledWith(CHAT_ROOM);
      expect(mockServer.emit).toHaveBeenCalledWith('userLeft', { username: 'testuser' });
    });
  });

  describe('handleMessage', () => {
    it('має зберегти повідомлення та розіслати його всім клієнтам через sendMessage', async () => {
      // Arrange
      const mockMessage = {
        id: 5,
        content: 'Hello World',
        authorId: 1,
        createdAt: new Date(),
      };
      const mockClient: any = {
        id: 'socket-id-1',
        data: { userId: 1, username: 'testuser' },
      };
      (chatService.saveMessage as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      await gateway.handleMessage({ content: 'Hello World' }, mockClient);

      // Assert
      expect(chatService.saveMessage).toHaveBeenCalledWith('Hello World', 1);
      expect(mockServer.to).toHaveBeenCalledWith(CHAT_ROOM);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'newMessage',
        expect.objectContaining({
          id: 5,
          content: 'Hello World',
          author: { username: 'testuser' },
        }),
      );
    });
  });
});
