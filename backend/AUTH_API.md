# Authentication API Documentation

## Обзор

API аутентификации предоставляет endpoints для регистрации, входа и управления пользователями с использованием JWT токенов.

## Endpoints

### 1. Регистрация пользователя

**POST** `/auth/register`

Создает нового пользователя и возвращает JWT токен.

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "address": "123 Main St", // опционально
  "phone": "+1234567890"    // опционально
}
```

#### Response (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

#### Validation Rules:
- `email`: Должен быть валидным email адресом
- `password`: Минимум 6 символов
- `name`: Обязательное поле
- `address`: Опциональное поле
- `phone`: Опциональное поле

### 2. Вход пользователя

**POST** `/auth/login`

Аутентифицирует пользователя и возвращает JWT токен.

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

### 3. Получение профиля пользователя

**GET** `/auth/profile`

Возвращает информацию о текущем пользователе.

#### Headers:
```
Authorization: Bearer <jwt_token>
```

#### Response (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "+1234567890",
  "role": "customer"
}
```

### 4. Тестовый защищенный endpoint

**GET** `/auth/test`

Тестовый endpoint для проверки JWT аутентификации.

#### Headers:
```
Authorization: Bearer <jwt_token>
```

#### Response (200):
```json
{
  "message": "This is a protected route",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

## Ошибки

### 400 Bad Request
```json
{
  "message": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### 409 Conflict
```json
{
  "message": "User with this email already exists",
  "statusCode": 409
}
```

## JWT Token

JWT токен содержит следующую информацию:
- `sub`: ID пользователя
- `email`: Email пользователя
- `role`: Роль пользователя
- `iat`: Время создания токена
- `exp`: Время истечения токена (7 дней)

## Безопасность

- Пароли хешируются с помощью bcrypt (10 раундов)
- JWT токены подписываются секретным ключом
- Токены действительны 7 дней
- Все защищенные endpoints требуют Bearer токен в заголовке Authorization

## Примеры использования

### Регистрация нового пользователя:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }'
```

### Вход пользователя:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Доступ к защищенному endpoint:
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Переменные окружения

Убедитесь, что в файле `.env` установлены следующие переменные:

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Роли пользователей

В системе поддерживаются следующие роли:
- `customer` - обычный пользователь (по умолчанию)
- `admin` - администратор

Роли хранятся в таблице `role` и связаны с пользователями через внешний ключ.

