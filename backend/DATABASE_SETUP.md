# Database Setup Guide

## Обзор

Этот проект использует PostgreSQL с сырым SQL (без ORM) для работы с базой данных. Схема базы данных основана на ERD диаграмме и включает все необходимые таблицы и связи.

## Структура

### Модули
- `DatabaseModule` - основной модуль для подключения к БД
- `DatabaseService` - сервис для выполнения SQL запросов
- `RepositoriesModule` - модуль с репозиториями для всех сущностей

### Репозитории
- `UserRepository` - управление пользователями
- `RoleRepository` - управление ролями
- `ProductRepository` - управление продуктами
- `IngredientRepository` - управление ингредиентами
- `OrderRepository` - управление заказами
- `CartRepository` - управление корзиной

## Установка и запуск

### 1. Переменные окружения

Создайте файл `.env` в корне backend папки:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kentucky_baked_pizza
DB_USER=postgres
DB_PASSWORD=postgres

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 2. Запуск PostgreSQL через Docker

```bash
# Из корня проекта
docker-compose up -d postgres
```

Это запустит PostgreSQL контейнер с автоматической инициализацией схемы.

### 3. Установка зависимостей

```bash
cd backend
pnpm install
```

### 4. Запуск приложения

```bash
pnpm run dev
```

## Использование

### DatabaseService

Основной сервис для выполнения SQL запросов:

```typescript
import { DatabaseService } from './database/database.service';

// Простой запрос
const result = await this.databaseService.query('SELECT * FROM users WHERE id = $1', [userId]);

// Транзакция
await this.databaseService.transaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO orders ...');
});
```

### Репозитории

Каждый репозиторий предоставляет CRUD операции и специфичные методы:

```typescript
import { UserRepository } from './repositories/user.repository';

// Найти пользователя по email
const user = await this.userRepository.findByEmail('user@example.com');

// Создать пользователя
const newUser = await this.userRepository.create({
  email: 'new@example.com',
  name: 'John Doe',
  role: 'customer'
});

// Найти пользователя с ролью
const userWithRole = await this.userRepository.findByIdWithRole(userId);
```

### Примеры использования

#### Работа с продуктами
```typescript
// Найти продукт с ингредиентами
const product = await this.productRepository.findByIdWithIngredients(productId);

// Добавить ингредиент к продукту
await this.productRepository.addIngredient(productId, ingredientId);

// Поиск по цене
const products = await this.productRepository.findByPriceRange(10, 50);
```

#### Работа с корзиной
```typescript
// Получить или создать корзину для пользователя
const cart = await this.cartRepository.findOrCreateByUserId(userId);

// Добавить товар в корзину
await this.cartRepository.addItem(cart.id, productId, 2);

// Получить корзину с товарами
const cartWithItems = await this.cartRepository.findByIdWithItems(cart.id);

// Конвертировать корзину в заказ
const orderId = await this.cartRepository.convertToOrder(cart.id);
```

#### Работа с заказами
```typescript
// Создать заказ с товарами
const order = await this.orderRepository.createWithItems(userId, [
  { productId: 1, count: 2 },
  { productId: 3, count: 1 }
]);

// Получить заказ с товарами
const orderWithItems = await this.orderRepository.findByIdWithItems(orderId);

// Получить общую стоимость заказа
const total = await this.orderRepository.getOrderTotal(orderId);
```

## Схема базы данных

### Таблицы
- `role` - роли пользователей
- `user` - пользователи
- `product` - продукты
- `ingredient` - ингредиенты
- `product_ingredient` - связь продуктов и ингредиентов
- `order` - заказы
- `order_item` - товары в заказах
- `cart` - корзины
- `cart_item` - товары в корзинах

### Связи
- User → Role (Many-to-One)
- User → Order (One-to-Many)
- User → Cart (One-to-One)
- Product → Ingredient (Many-to-Many через ProductIngredient)
- Order → Product (Many-to-Many через OrderItem)
- Cart → Product (Many-to-Many через CartItem)

## Мониторинг

### pgAdmin
Доступен по адресу: http://localhost:8080
- Email: admin@kentucky-baked-pizza.com
- Password: admin

### Статистика подключений
```typescript
const stats = await this.databaseService.getStats();
console.log('Database stats:', stats);
```

## Безопасность

- Все запросы используют параметризованные запросы для предотвращения SQL инъекций
- Пароли хранятся в хешированном виде
- SSL подключение в production режиме
- Валидация данных на уровне базы данных

## Производительность

- Созданы индексы для часто используемых полей
- Используется connection pooling
- Логирование медленных запросов
- Транзакции для обеспечения целостности данных
