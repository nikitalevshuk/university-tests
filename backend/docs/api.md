# API Documentation

## Обзор API

REST API для системы психологического тестирования, построен на FastAPI с автоматической генерацией документации.

**Base URL:** `http://localhost:8000`

**Версия:** 2.0.0

**Документация:**
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации.

### Схема аутентификации
- **Тип:** Bearer Token
- **Заголовок:** `Authorization: Bearer <token>`
- **Альтернатива:** HTTP-only cookies (`access_token`)

### Время жизни токена
- **По умолчанию:** 30 минут
- **Настраивается:** через `ACCESS_TOKEN_EXPIRE_MINUTES`

## Эндпоинты

### Системные эндпоинты

#### GET /
**Описание:** Корневой эндпоинт с информацией об API

**Ответ:**
```json
{
    "message": "API системы психологического тестирования",
    "version": "2.0.0",
    "docs": "/docs",
    "redoc": "/redoc"
}
```

#### GET /health
**Описание:** Проверка состояния API

**Ответ:**
```json
{
    "status": "healthy",
    "message": "API работает корректно",
    "version": "2.0.0"
}
```

---

### Аутентификация (`/auth`)

#### POST /auth/register
**Описание:** Регистрация нового пользователя

**Тело запроса:**
```json
{
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "faculty": "ИТ",
    "course": 1,
    "password": "secure_password"
}
```

**Ответ (201):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
}
```

**Ошибки:**
- `400`: Пользователь с таким ФИО уже существует

#### POST /auth/login
**Описание:** Авторизация пользователя

**Тело запроса:**
```json
{
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "faculty": "ИТ",
    "course": 1,
    "password": "secure_password"
}
```

**Ответ (200):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
}
```

**Ошибки:**
- `401`: Неверное ФИО или пароль

#### POST /auth/logout
**Описание:** Выход из системы

**Авторизация:** Не требуется

**Ответ (200):**
```json
{
    "message": "Успешный выход из системы"
}
```

#### GET /auth/me
**Описание:** Получение информации о текущем пользователе

**Авторизация:** Требуется

**Ответ (200):**
```json
{
    "id": 1,
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "full_name": "Иванов Иван Иванович",
    "faculty": "ИТ",
    "course": 1,
    "is_admin": false,
    "completed_tests": []
}
```

**Ошибки:**
- `401`: Не авторизован

---

### Тесты (`/tests`)

#### GET /tests/
**Описание:** Получение списка всех тестов

**Авторизация:** Требуется

**Ответ (200):**
```json
[
    {
        "id": 1,
        "title": "Тест на темперамент",
        "description": "Определение типа темперамента",
        "questions": [
            {
                "id": 1,
                "text": "Вопрос 1",
                "options": ["Вариант 1", "Вариант 2"]
            }
        ]
    }
]
```

#### GET /tests/{test_id}
**Описание:** Получение конкретного теста по ID

**Параметры:**
- `test_id` (integer): ID теста

**Авторизация:** Требуется

**Ответ (200):**
```json
{
    "id": 1,
    "title": "Тест на темперамент",
    "description": "Определение типа темперамента",
    "questions": [...]
}
```

**Ошибки:**
- `404`: Тест не найден

#### POST /tests/{test_id}/submit
**Описание:** Отправка ответов на тест

**Параметры:**
- `test_id` (integer): ID теста

**Тело запроса:**
```json
{
    "answers": [
        {
            "question_id": 1,
            "selected_option": 0
        }
    ]
}
```

**Авторизация:** Требуется

**Ответ (200):**
```json
{
    "message": "Тест успешно пройден",
    "result": "Ваш результат: Сангвиник"
}
```

**Ошибки:**
- `400`: Тест уже пройден
- `404`: Тест не найден

---

### Пользователи (`/users`)

#### GET /users/me/results
**Описание:** Получение результатов тестов текущего пользователя

**Авторизация:** Требуется

**Ответ (200):**
```json
[
    {
        "test_id": 1,
        "test_title": "Тест на темперамент",
        "result": "Сангвиник",
        "completed_at": "2024-01-15T10:30:00"
    }
]
```

#### GET /users/ (Админ)
**Описание:** Получение списка всех пользователей

**Авторизация:** Требуется (только админ)

**Ответ (200):**
```json
[
    {
        "id": 1,
        "full_name": "Иванов Иван Иванович",
        "faculty": "ИТ",
        "course": 1,
        "completed_tests": []
    }
]
```

**Ошибки:**
- `403`: Недостаточно прав

---

## Схемы данных

### User (Пользователь)
```json
{
    "id": "integer",
    "first_name": "string",
    "last_name": "string", 
    "middle_name": "string",
    "full_name": "string",
    "faculty": "enum(ИТ, Экономика, Юриспруденция, Медицина)",
    "course": "integer (1-6)",
    "is_admin": "boolean",
    "completed_tests": "array"
}
```

### Test (Тест)
```json
{
    "id": "integer",
    "title": "string",
    "description": "string",
    "questions": [
        {
            "id": "integer",
            "text": "string",
            "options": ["string"]
        }
    ]
}
```

### Token (JWT токен)
```json
{
    "access_token": "string",
    "token_type": "string",
    "expires_in": "integer"
}
```

## Коды ошибок

### HTTP Status Codes

- **200** - OK: Успешный запрос
- **201** - Created: Ресурс создан
- **400** - Bad Request: Неверный запрос
- **401** - Unauthorized: Не авторизован
- **403** - Forbidden: Доступ запрещен
- **404** - Not Found: Ресурс не найден
- **422** - Unprocessable Entity: Ошибка валидации
- **500** - Internal Server Error: Внутренняя ошибка сервера

### Формат ошибок

```json
{
    "detail": "Описание ошибки"
}
```

Для ошибок валидации (422):
```json
{
    "detail": [
        {
            "loc": ["body", "field_name"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

## CORS настройки

API настроен для работы с фронтендом:

**Разрешенные origins:**
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8080` (Webpack dev server)

**Разрешенные методы:** GET, POST, PUT, DELETE, OPTIONS

**Разрешенные заголовки:** Все (*)

**Credentials:** Разрешены (для httpOnly cookies)

## Примеры использования

### JavaScript/TypeScript

```javascript
// Регистрация
const registerUser = async (userData) => {
    const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // для httpOnly cookies
        body: JSON.stringify(userData)
    });
    
    return await response.json();
};

// Авторизованный запрос
const getTests = async (token) => {
    const response = await fetch('http://localhost:8000/tests/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    return await response.json();
};
```

### Python (requests)

```python
import requests

# Регистрация
user_data = {
    "first_name": "Иван",
    "last_name": "Иванов",  
    "middle_name": "Иванович",
    "faculty": "ИТ",
    "course": 1,
    "password": "secure_password"
}

response = requests.post(
    'http://localhost:8000/auth/register',
    json=user_data
)

token = response.json()['access_token']

# Авторизованный запрос
headers = {'Authorization': f'Bearer {token}'}
tests = requests.get('http://localhost:8000/tests/', headers=headers)
```

### cURL

```bash
# Регистрация
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
         "first_name": "Иван",
         "last_name": "Иванов",
         "middle_name": "Иванович", 
         "faculty": "ИТ",
         "course": 1,
         "password": "secure_password"
     }'

# Авторизованный запрос
curl -X GET "http://localhost:8000/tests/" \
     -H "Authorization: Bearer <token>"
``` 