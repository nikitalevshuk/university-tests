# Интеграция фронтенда с бэкендом

## 🔗 API Endpoints

### Авторизация

#### POST /auth/register
Регистрация нового пользователя
```javascript
const response = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Важно для cookies
  body: JSON.stringify({
    first_name: "Иван",
    last_name: "Иванов", 
    middle_name: "Иванович",
    faculty: "ФИБ",
    course: 1,
    password: "password123"
  })
});
```

#### POST /auth/login
Авторизация пользователя
```javascript
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: "Иванович", 
    password: "password123"
  })
});
```

#### GET /auth/me
Получение информации о текущем пользователе
```javascript
const response = await fetch('http://localhost:8000/auth/me', {
  credentials: 'include'
});
```

#### POST /auth/logout
Выход из системы
```javascript
const response = await fetch('http://localhost:8000/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

### Тесты

#### GET /tests
Получение списка доступных тестов
```javascript
const response = await fetch('http://localhost:8000/tests');
```

#### GET /user/tests/status
Получение статуса тестов для пользователя
```javascript
const response = await fetch('http://localhost:8000/user/tests/status', {
  credentials: 'include'
});
```

#### POST /user/tests/{test_id}/save-progress
Сохранение прогресса теста
```javascript
const response = await fetch(`http://localhost:8000/user/tests/${testId}/save-progress`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    current_question_index: 5,
    answers: ["да", "нет", "не знаю", "да", "нет"]
  })
});
```

#### POST /user/tests/{test_id}/complete
Завершение теста
```javascript
const response = await fetch(`http://localhost:8000/user/tests/${testId}/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    answers: ["да", "нет", "не знаю", "да", "нет"],
    result: {
      score: 85,
      interpretation: "Высокий уровень"
    }
  })
});
```

## 🍪 Работа с Cookies

Бэкенд автоматически устанавливает httpOnly cookie с JWT токеном при успешной авторизации/регистрации. Фронтенд должен:

1. Использовать `credentials: 'include'` во всех запросах
2. Не пытаться читать/записывать токен вручную
3. Проверять статус ответа для определения авторизации

## 🔄 Обновление компонента AuthForm

```javascript
// src/components/AuthForm.jsx
import React, { useState } from 'react';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    faculty: '',
    course: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? {
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          password: formData.password
        }
      : formData;

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Перенаправление на главную страницу
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  return (
    // JSX компонента...
  );
};
```

## 🛡️ Проверка авторизации

```javascript
// src/utils/auth.js
export const checkAuth = async () => {
  try {
    const response = await fetch('http://localhost:8000/auth/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const logout = async () => {
  try {
    await fetch('http://localhost:8000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
};
```

## 📊 Работа с тестами

```javascript
// src/utils/tests.js
export const getTestsStatus = async () => {
  try {
    const response = await fetch('http://localhost:8000/user/tests/status', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Ошибка получения статуса тестов');
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
};

export const saveTestProgress = async (testId, progress) => {
  try {
    const response = await fetch(`http://localhost:8000/user/tests/${testId}/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(progress)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Ошибка сохранения прогресса:', error);
    return false;
  }
};
```

## 🚀 Запуск

1. **Бэкенд**: `python main.py` (порт 8000)
2. **Фронтенд**: `npm run dev` (порт 3000 или 5173)

Убедитесь, что CORS настроен правильно для вашего порта фронтенда! 