# Chat Server — Серверна частина чат-додатку

Серверна частина чат-додатку з підтримкою мультимедійних даних.  
Розроблено в рамках навчальної практики з програмування.

**Автор:** Кудлай Микита Андрійович, група КН33

---

## Технологічний стек

- **NestJS** — серверний фреймворк
- **Socket.IO** — WebSocket-комунікація в реальному часі
- **PostgreSQL** — база даних
- **Prisma ORM** — доступ до БД
- **JWT** — автентифікація
- **Multer** — завантаження файлів

---

## Вимоги

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Запуск проекту

### 1. Встановити залежності

```bash
npm install
```

### 2. Налаштувати змінні середовища

```bash
cp .env.example .env
```

Відредагуйте `.env`, вказавши параметри підключення до PostgreSQL:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chat_db"
JWT_SECRET="your-secret-key"
```

### 3. Згенерувати Prisma Client та виконати міграції

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Запустити сервер

```bash
# Режим розробки (з автоперезапуском)
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

Сервер запуститься на `http://localhost:3000`

---

## API Ендпоінти

### Автентифікація

| Метод | URL | Опис | Захист |
|-------|-----|------|--------|
| POST | `/auth/register` | Реєстрація нового користувача | — |
| POST | `/auth/login` | Вхід та отримання JWT-токена | — |

**Приклад запиту на реєстрацію:**
```json
POST /auth/register
{ "username": "myuser", "password": "mypassword" }
```

### Файли

| Метод | URL | Опис | Захист |
|-------|-----|------|--------|
| POST | `/files/upload` | Завантаження файлу | JWT |
| GET | `/files/:filename` | Отримання файлу | — |
| GET | `/files` | Список файлів | JWT |

Для завантаження файлу використовується `multipart/form-data` з полем `file`.

---

## WebSocket Events (Socket.IO)

Підключення: `http://localhost:3000`

**Аутентифікація при підключенні:**
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'Bearer <JWT_TOKEN>' }
});
```

| Подія | Напрямок | Опис |
|-------|----------|------|
| `sendMessage` | Клієнт → Сервер | Надіслати повідомлення |
| `newMessage` | Сервер → Клієнти | Нове повідомлення для всіх |
| `history` | Сервер → Клієнт | Історія при підключенні |
| `userJoined` | Сервер → Клієнти | Повідомлення про новий вхід |
| `userLeft` | Сервер → Клієнти | Повідомлення про вихід |

---

## Тестування

```bash
# Запустити всі тести
npm run test

# З покриттям
npm run test:cov
```

---

## Структура проекту

```
src/
├── auth/                    # Модуль автентифікації
│   ├── dto/                 # DTO для валідації запитів
│   ├── repositories/        # Репозиторій користувачів
│   ├── strategies/          # JWT-стратегія Passport
│   ├── auth.controller.ts   # HTTP-контролер
│   ├── auth.service.ts      # Бізнес-логіка
│   └── auth.module.ts       # Модуль NestJS
├── chat/                    # Модуль чату
│   ├── repositories/        # Репозиторій повідомлень
│   ├── chat.gateway.ts      # WebSocket-шлюз
│   ├── chat.service.ts      # Бізнес-логіка
│   └── chat.module.ts
├── files/                   # Модуль файлів
│   ├── repositories/        # Репозиторій файлів
│   ├── files.controller.ts  # HTTP-контролер
│   ├── files.service.ts     # Бізнес-логіка
│   └── files.module.ts
├── prisma/                  # Модуль бази даних
│   ├── prisma.service.ts    # Сервіс Prisma Client
│   └── prisma.module.ts
├── common/                  # Спільні компоненти
│   ├── guards/              # JWT-гард
│   └── filters/             # Фільтр виключень
├── app.module.ts            # Кореневий модуль
└── main.ts                  # Точка входу
uploads/                     # Папка для завантажених файлів
prisma/
└── schema.prisma            # Схема бази даних
```
