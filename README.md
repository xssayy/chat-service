# Chat Service

REST API + WebSocket чат-сервер із JWT-автентифікацією та підтримкою завантаження файлів.

---

## Технічний стек

- **NestJS** — серверний фреймворк
- **Socket.IO** — WebSocket-комунікація в реальному часі
- **PostgreSQL** — реляційна база даних
- **Prisma ORM** — доступ до БД та міграції
- **JWT / Passport** — автентифікація
- **Multer** — завантаження файлів
- **Swagger** — документація API (`/api/docs`)

---

## Вимоги

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Встановлення та запуск

```bash
# 1. Встановити залежності
npm install

# 2. Скопіювати та заповнити змінні середовища
cp .env.example .env

# 3. Згенерувати Prisma Client та виконати міграції
npx prisma generate
npx prisma migrate deploy

# 4. Запустити сервер
npm run start:dev        # розробка (з автоперезапуском)
npm run build && npm run start:prod   # продакшн
```

Сервер доступний на `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api/docs`

---

## Налаштування .env

| Змінна | Опис | Приклад |
|---|---|---|
| `DATABASE_URL` | Рядок підключення до PostgreSQL | `postgresql://user:pass@localhost:5432/chat_db` |
| `JWT_SECRET` | Секретний ключ для підпису JWT | `supersecretkey` |
| `JWT_EXPIRES_IN` | Час життя токена | `7d` |
| `PORT` | Порт сервера | `3000` |

---

## HTTP API

| Метод | Шлях | Захист | Опис |
|---|---|---|---|
| `POST` | `/auth/register` | — | Реєстрація (`username` 3–20 симв., `password` мін. 6 симв.) |
| `POST` | `/auth/login` | — | Вхід, повертає JWT-токен |
| `POST` | `/files/upload` | JWT | Завантаження файлу (`multipart/form-data`, поле `file`) |
| `GET` | `/files/:filename` | JWT | Отримання файлу за іменем |

**Заголовок для захищених запитів:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## WebSocket події

Підключення через Socket.IO до `http://localhost:3000`.

**Автентифікація при підключенні:**
```js
const socket = io('http://localhost:3000', {
  auth: { token: '<JWT_TOKEN>' }
});
```

| Подія | Напрямок | Payload | Опис |
|---|---|---|---|
| `sendMessage` | клієнт → сервер | `{ content: string }` | Надіслати текстове повідомлення |
| `newMessage` | сервер → клієнти | `{ id, content, author: { username }, createdAt }` | Нове повідомлення від будь-якого користувача |
| `fileUploaded` | сервер → клієнти | `{ id, filename, originalName, mimetype, owner: { username }, messageId, createdAt }` | Сповіщення про завантажений файл |
| `history` | сервер → клієнт | `Message[]` | Остання історія повідомлень (надсилається при підключенні) |
| `userJoined` | сервер → клієнти | `{ username }` | Користувач приєднався до чату |
| `userLeft` | сервер → клієнти | `{ username }` | Користувач покинув чат |

---

## Структура проєкту

```
src/
├── auth/
│   ├── dto/                  # Валідація вхідних даних (RegisterDto, LoginDto)
│   ├── repositories/         # Репозиторій користувачів
│   ├── strategies/           # JWT-стратегія Passport
│   ├── tests/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── chat/
│   ├── repositories/         # Репозиторій повідомлень
│   ├── tests/
│   ├── chat.gateway.ts       # WebSocket-шлюз (Socket.IO)
│   ├── chat.service.ts
│   └── chat.module.ts
├── files/
│   ├── repositories/         # Репозиторій файлів
│   ├── tests/
│   ├── files.controller.ts
│   ├── files.service.ts
│   └── files.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── guards/               # JwtAuthGuard
│   └── filters/              # HttpExceptionFilter
├── app.module.ts
└── main.ts
```

---

## Тести

```bash
# Запустити всі тести
npm run test

# З покриттям коду
npm run test:cov
```
