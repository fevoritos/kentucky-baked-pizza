# Kentucky Baked Pizza - Quick Start Guide

## Что было реализовано

✅ **Полная система работы с базой данных PostgreSQL без ORM**
- Модуль `DatabaseModule` с подключением к PostgreSQL
- Сервис `DatabaseService` для выполнения сырых SQL запросов
- Репозитории для всех сущностей из ERD схемы
- TypeScript типы для всех таблиц
- Docker контейнер с PostgreSQL
- SQL схема базы данных

## Структура проекта

```
backend/
├── src/
│   ├── database/
│   │   ├── database.module.ts      # Модуль БД
│   │   └── database.service.ts     # Сервис для SQL запросов
│   ├── repositories/
│   │   ├── base.repository.ts      # Базовый репозиторий
│   │   ├── user.repository.ts      # Репозиторий пользователей
│   │   ├── role.repository.ts      # Репозиторий ролей
│   │   ├── product.repository.ts   # Репозиторий продуктов
│   │   ├── ingredient.repository.ts # Репозиторий ингредиентов
│   │   ├── order.repository.ts     # Репозиторий заказов
│   │   ├── cart.repository.ts      # Репозиторий корзины
│   │   └── repositories.module.ts  # Модуль репозиториев
│   ├── types/
│   │   └── database.types.ts       # TypeScript типы
│   └── ...
├── database/
│   └── schema.sql                  # SQL схема БД
└── ...
```

## Быстрый старт

### 1. Запуск базы данных

```bash
# Из корня проекта
docker-compose up -d postgres
```

### 2. Настройка переменных окружения

Создайте файл `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kentucky_baked_pizza
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
```

### 3. Установка зависимостей

```bash
cd backend
pnpm install
```

### 4. Запуск приложения

```bash
pnpm run dev
```

### 5. Проверка работы

Откройте в браузере:
- http://localhost:3000 - основное приложение
- http://localhost:3000/database-info - информация о БД

## Основные возможности

### DatabaseService
- Выполнение SQL запросов с параметрами
- Транзакции
- Connection pooling
- Логирование запросов
- Статистика подключений

### Репозитории
Каждый репозиторий предоставляет:
- CRUD операции (create, read, update, delete)
- Специфичные методы для каждой сущности
- Работа с связанными данными
- Транзакции для сложных операций

### Примеры использования

```typescript
// Создание пользователя
const user = await this.userRepository.create({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'customer'
});

// Поиск продукта с ингредиентами
const product = await this.productRepository.findByIdWithIngredients(1);

// Создание заказа
const order = await this.orderRepository.createWithItems(userId, [
  { productId: 1, count: 2 },
  { productId: 3, count: 1 }
]);

// Работа с корзиной
const cart = await this.cartRepository.findOrCreateByUserId(userId);
await this.cartRepository.addItem(cart.id, productId, 2);
```

## Схема базы данных

База данных включает все таблицы из ERD:
- **User** - пользователи с ролями
- **Product** - продукты с ингредиентами
- **Order** - заказы с товарами
- **Cart** - корзины с товарами
- **Ingredient** - ингредиенты
- **Role** - роли пользователей

## Безопасность

- Параметризованные запросы (защита от SQL инъекций)
- Валидация данных на уровне БД
- SSL в production
- Хеширование паролей

## Мониторинг

- Логирование всех SQL запросов
- Статистика подключений
- pgAdmin для управления БД
- Health check endpoint

## Следующие шаги

1. Добавить аутентификацию и авторизацию
2. Создать API endpoints для всех операций
3. Добавить валидацию данных
4. Настроить логирование
5. Добавить тесты
6. Настроить CI/CD

## Полезные команды

```bash
# Остановка БД
docker-compose down

# Просмотр логов БД
docker-compose logs postgres

# Подключение к БД
docker exec -it kentucky-baked-pizza-db psql -U postgres -d kentucky_baked_pizza

# Перезапуск приложения
pnpm run dev
```

