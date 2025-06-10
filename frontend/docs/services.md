# Сервисы Frontend

## Обзор

Сервисы отвечают за взаимодействие с backend API и обработку бизнес-логики на клиенте.

**Расположение:** `frontend/src/services/`

## API Service

### Базовый класс ApiService

**Файл:** `frontend/src/services/api.js`

#### Описание
Базовый класс для выполнения HTTP запросов к backend API.

#### Конфигурация
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

#### Основные методы

##### `request(endpoint, options)`
Базовый метод для выполнения HTTP запросов.

**Параметры:**
- `endpoint` (string) - путь к API эндпоинту
- `options` (object) - опции запроса

**Особенности:**
- Автоматическое добавление заголовков
- Поддержка httpOnly cookies через `credentials: 'include'`
- Обработка ошибок HTTP
- Парсинг JSON ответов

**Пример:**
```javascript
const response = await api.request('/auth/me', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});
```

##### `get(endpoint, params)`
Выполняет GET запрос.

**Параметры:**
- `endpoint` (string) - путь к эндпоинту
- `params` (object) - параметры запроса (query string)

##### `post(endpoint, data)`
Выполняет POST запрос.

**Параметры:**
- `endpoint` (string) - путь к эндпоинту
- `data` (object) - данные для отправки в теле запроса

##### `put(endpoint, data)`
Выполняет PUT запрос.

##### `delete(endpoint)`
Выполняет DELETE запрос.

---

## Сервис аутентификации

### authService

#### `register(userData)`
Регистрация нового пользователя.

**Параметры:**
```javascript
{
  firstName: string,
  lastName: string,
  middleName: string,
  faculty: string,
  course: number,
  password: string
}
```

**Возвращает:**
```javascript
{
  access_token: string,
  token_type: "bearer",
  expires_in: number
}
```

**Пример использования:**
```javascript
import { authService } from '../services/api';

const userData = {
  firstName: 'Иван',
  lastName: 'Иванов',
  middleName: 'Иванович',
  faculty: 'ФИБ',
  course: 1,
  password: 'securePassword123'
};

try {
  const response = await authService.register(userData);
  console.log('Токен:', response.access_token);
} catch (error) {
  console.error('Ошибка регистрации:', error.message);
}
```

#### `login(credentials)`
Авторизация пользователя.

**Параметры:**
```javascript
{
  firstName: string,
  lastName: string,
  middleName: string,
  faculty: string,
  course: number,
  password: string
}
```

**Возвращает:** Аналогично `register()`

#### `logout()`
Выход из системы.

**Описание:** Удаляет httpOnly cookie с токеном.

**Возвращает:**
```javascript
{
  message: "Успешный выход из системы"
}
```

#### `getCurrentUser()`
Получение информации о текущем пользователе.

**Требует:** Авторизацию (JWT токен)

**Возвращает:**
```javascript
{
  id: number,
  first_name: string,
  last_name: string,
  middle_name: string,
  full_name: string,
  faculty: string,
  course: number,
  is_admin: boolean,
  completed_tests: array
}
```

---

## Сервис тестов

### testsService

#### `getAvailableTests()`
Получение списка всех доступных тестов.

**Требует:** Авторизацию

**Возвращает:**
```javascript
[
  {
    id: number,
    title: string,
    description: string,
    questions: array
  }
]
```

#### `getTestById(testId)`
Получение конкретного теста по ID.

**Параметры:**
- `testId` (number) - ID теста

**Требует:** Авторизацию

#### `getUserTestsStatus()`
Получение статуса всех тестов для пользователя.

**Возвращает:**
```javascript
{
  "1": {
    status: "completed" | "not_started",
    completed_at: string | null,
    result: object | null
  }
}
```

#### `loadTestData(filename)`
Загрузка данных теста из JSON файла.

**Параметры:**
- `filename` (string) - имя файла теста

**Описание:** 
Загружает тестовые данные из статических JSON файлов в папке `public/`.

**Структура файла теста:**
```javascript
[
  {
    // Метаданные теста (первый элемент)
    title: "Название теста",
    description: "Описание теста"
  },
  {
    // Вопросы теста
    question: "Текст вопроса",
    options: ["Вариант 1", "Вариант 2"],
    // дополнительные поля...
  }
]
```

**Возвращает:**
```javascript
{
  title: string,
  description: string,
  questions: array
}
```

#### `completeTest(testId, completionData)`
Завершение теста и отправка результатов.

**Параметры:**
- `testId` (number) - ID теста
- `completionData` (object) - данные о завершении

**Структура completionData:**
```javascript
{
  answers: [
    {
      question_id: number,
      selected_option: number
    }
  ],
  result: {
    type: string,
    score: number,
    details: object
  }
}
```

#### `getTestResults(testId)`
Получение результатов конкретного теста.

**Параметры:**
- `testId` (number) - ID теста

**Возвращает:**
```javascript
{
  test_id: number,
  test_title: string,
  result: object,
  completed_at: string
}
```

---

## Утилиты API

### apiUtils

#### `isAuthError(error)`
Проверяет, является ли ошибка ошибкой авторизации.

**Параметры:**
- `error` (Error) - объект ошибки

**Возвращает:** boolean

**Использование:**
```javascript
try {
  await api.get('/protected-endpoint');
} catch (error) {
  if (apiUtils.isAuthError(error)) {
    // Перенаправить на страницу входа
    navigate('/login');
  }
}
```

#### `isValidationError(error)`
Проверяет, является ли ошибка ошибкой валидации.

#### `formatErrorMessage(error)`
Форматирует сообщение об ошибке для показа пользователю.

**Возвращает:** string - пользовательское сообщение об ошибке

---

## Обработка ошибок

### Типы ошибок

#### Ошибки авторизации (401)
```javascript
// Автоматическое определение
if (apiUtils.isAuthError(error)) {
  // Очистить токен и перенаправить на вход
}
```

#### Ошибки валидации (422)
```javascript
// Показать ошибки валидации в форме
if (apiUtils.isValidationError(error)) {
  setFormErrors(error.details);
}
```

#### Сетевые ошибки
```javascript
// Показать общее сообщение о проблемах с сетью
if (error.name === 'NetworkError') {
  showToast('Проблемы с подключением к серверу');
}
```

### Паттерн обработки в компонентах

```javascript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

const handleApiCall = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    const result = await apiService.someMethod();
    // Обработка успешного результата
  } catch (err) {
    if (apiUtils.isAuthError(err)) {
      // Перенаправление на вход
      navigate('/login');
    } else {
      setError(apiUtils.formatErrorMessage(err));
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

## Кеширование и оптимизация

### Текущее состояние
В текущей версии кеширование не реализовано. Каждый запрос выполняется заново.

### Рекомендации по улучшению

#### React Query
```javascript
import { useQuery } from 'react-query';

const useTests = () => {
  return useQuery('tests', testsService.getAvailableTests, {
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
};
```

#### SWR
```javascript
import useSWR from 'swr';

const useUser = () => {
  const { data, error } = useSWR('/auth/me', authService.getCurrentUser);
  
  return {
    user: data,
    isLoading: !error && !data,
    isError: error
  };
};
```

#### Локальное кеширование
```javascript
// Простое кеширование в localStorage
const cacheService = {
  set(key, data, ttl = 300000) { // 5 минут по умолчанию
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  }
};
```

---

## Конфигурация окружений

### Переменные окружения

**Файл:** `frontend/.env.local`

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Психологическое тестирование
VITE_DEBUG=true
```

### Использование в коде
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEBUG = import.meta.env.VITE_DEBUG === 'true';
```

### Конфигурация для разных окружений

#### Development
```javascript
const config = {
  apiBaseUrl: 'http://localhost:8000',
  timeout: 10000,
  retries: 3
};
```

#### Production
```javascript
const config = {
  apiBaseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 1
};
```

---

## Безопасность

### Токены JWT
- Автоматическое включение в заголовки
- Поддержка httpOnly cookies
- Обработка истечения токенов

### CORS
- Настройка `credentials: 'include'`
- Правильные заголовки для cross-origin запросов

### Валидация данных
- Клиентская валидация перед отправкой
- Санитизация пользовательского ввода
- Проверка типов данных

### Пример безопасного API вызова
```javascript
const secureApiCall = async (endpoint, data) => {
  // Валидация входных данных
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Некорректный endpoint');
  }
  
  // Санитизация данных
  const sanitizedData = sanitizeInput(data);
  
  // Выполнение запроса с обработкой ошибок
  try {
    return await api.post(endpoint, sanitizedData);
  } catch (error) {
    // Логирование ошибки (без чувствительных данных)
    console.error('API Error:', {
      endpoint,
      status: error.status,
      message: error.message
    });
    throw error;
  }
};
```

---

## Тестирование сервисов

### Unit тесты
```javascript
import { authService } from '../api';

// Мокирование fetch
global.fetch = jest.fn();

describe('authService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });
  
  test('login отправляет корректные данные', async () => {
    const mockResponse = { access_token: 'token123' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const credentials = {
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Иванович',
      faculty: 'ФИБ',
      course: 1,
      password: 'password'
    };
    
    const result = await authService.login(credentials);
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          first_name: 'Иван',
          last_name: 'Иванов',
          middle_name: 'Иванович',
          faculty: 'ФИБ',
          course: 1,
          password: 'password'
        })
      })
    );
    
    expect(result).toEqual(mockResponse);
  });
});
```

### Integration тесты
```javascript
// Тестирование с реальным API (в тестовом окружении)
describe('API Integration', () => {
  test('полный цикл авторизации', async () => {
    // Регистрация
    const userData = generateTestUser();
    const registerResponse = await authService.register(userData);
    expect(registerResponse.access_token).toBeDefined();
    
    // Получение информации о пользователе
    const userInfo = await authService.getCurrentUser();
    expect(userInfo.full_name).toBe(`${userData.lastName} ${userData.firstName} ${userData.middleName}`);
    
    // Выход
    const logoutResponse = await authService.logout();
    expect(logoutResponse.message).toBe('Успешный выход из системы');
  });
}); 