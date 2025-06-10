# Архитектура проекта системы психологического тестирования

## Общая структура проекта

Проект представляет собой web-приложение для психологического тестирования студентов с разделением на backend и frontend части.

```
university-tests/
├── backend/           # API сервер на FastAPI
├── frontend/          # Web-интерфейс на React
├── database/          # Скрипты базы данных
├── docs/              # Документация проекта
├── docker-compose.yml # Docker конфигурация
└── Makefile          # Автоматизация команд
```

## Архитектурный стиль

**Архитектура:** Клиент-серверная архитектура с REST API

**Паттерн:** Трехуровневая архитектура
- **Уровень представления:** React SPA (Single Page Application)
- **Уровень бизнес-логики:** FastAPI REST API
- **Уровень данных:** PostgreSQL база данных

## Backend архитектура

### Технологический стек
- **Framework:** FastAPI 0.104.1
- **ORM:** SQLAlchemy 2.0.23
- **База данных:** PostgreSQL
- **Миграции:** Alembic 1.12.1
- **Аутентификация:** JWT (python-jose)
- **Хеширование паролей:** Passlib с bcrypt
- **Валидация:** Pydantic 2.5.0
- **Контейнеризация:** Docker

### Структура backend
```
backend/
├── main.py              # Точка входа приложения
├── requirements.txt     # Зависимости Python
├── Dockerfile          # Docker конфигурация
├── alembic.ini         # Конфигурация миграций
├── routers/            # API роутеры
│   ├── auth.py        # Аутентификация и авторизация
│   ├── tests.py       # Управление тестами
│   └── users.py       # Управление пользователями
├── models/             # SQLAlchemy модели
│   ├── user.py        # Модель пользователя
│   └── test.py        # Модель теста
├── schemas/            # Pydantic схемы валидации
├── auth/              # Модуль аутентификации
├── utils/             # Утилиты и вспомогательные функции
├── db/                # Настройки базы данных
└── alembic/           # Миграции базы данных
```

### Архитектурные принципы backend
- **Dependency Injection** через FastAPI
- **Repository Pattern** для работы с данными
- **DTO Pattern** через Pydantic схемы
- **Layered Architecture** (роутеры → бизнес-логика → модели)

## Frontend архитектура

### Технологический стек
- **Framework:** React 18.2.0
- **Bundler:** Vite 4.5.0
- **Routing:** React Router DOM 7.6.1
- **Styling:** Tailwind CSS 3.3.5
- **UI Components:** Radix UI
- **Animations:** Framer Motion 10.16.4
- **Icons:** Lucide React
- **Веб-сервер:** Nginx (в production)

### Структура frontend
```
frontend/
├── index.html          # HTML шаблон
├── package.json        # Зависимости Node.js
├── Dockerfile          # Docker конфигурация
├── nginx.conf          # Конфигурация Nginx
├── vite.config.js      # Конфигурация Vite
├── tailwind.config.js  # Конфигурация Tailwind
├── src/
│   ├── main.jsx       # Точка входа React
│   ├── App.jsx        # Главный компонент
│   ├── index.css      # Глобальные стили
│   ├── components/    # React компоненты
│   ├── services/      # API клиенты
│   └── lib/          # Утилиты и хелперы
└── public/           # Статические файлы
```

### Архитектурные принципы frontend
- **Component-Based Architecture**
- **Hooks Pattern** для управления состоянием
- **Service Layer** для API взаимодействия
- **Atomic Design** для UI компонентов

## Взаимодействие компонентов

### Коммуникация Frontend ↔ Backend
- **Протокол:** HTTP/HTTPS REST API
- **Формат данных:** JSON
- **Аутентификация:** JWT Bearer tokens
- **CORS:** Настроен для фронтенда

### Схема взаимодействия
```
React App → HTTP Request → FastAPI → SQLAlchemy → PostgreSQL
    ↓                                                    ↓
Browser ← JSON Response ← FastAPI ← SQLAlchemy ← PostgreSQL
```

## База данных

### Схема данных
- **users** - Пользователи системы (студенты, преподаватели)
- **tests** - Психологические тесты
- Связи реализованы через Foreign Keys

### Миграции
Управление схемой БД через Alembic:
- Версионирование изменений
- Автоматическая генерация миграций
- Возможность отката изменений

## Безопасность

### Аутентификация и авторизация
- **JWT токены** для аутентификации
- **Хеширование паролей** через bcrypt
- **Ролевая модель** (user, admin)
- **CORS защита** от cross-origin запросов

### Принципы безопасности
- Валидация всех входящих данных
- Защита от SQL injection через ORM
- HTTP-only cookies для токенов (опционально)
- Rate limiting (может быть добавлен)

## Контейнеризация

### Docker архитектура
- **Многоэтапная сборка** для frontend с Nginx
- **Отдельные контейнеры** для каждого сервиса
- **Docker Compose** для оркестрации
- **Volumes** для персистентности данных

### Компоненты
- **PostgreSQL** - база данных
- **Backend** - FastAPI API сервер
- **Frontend** - React приложение с Nginx
- **Сети** - изолированная Docker сеть

## Масштабируемость

### Горизонтальное масштабирование
- Stateless API позволяет запуск множественных инстансов
- Load balancer для распределения нагрузки
- CDN для статических файлов frontend

### Вертикальное масштабирование
- Оптимизация запросов к БД
- Кеширование часто используемых данных
- Индексы в базе данных

## Мониторинг и логирование

### Логирование
- Логи FastAPI через uvicorn
- Структурированное логирование (JSON)
- Различные уровни логов

### Мониторинг
- Health check endpoints
- Метрики производительности
- Мониторинг базы данных

## Тестирование

### Backend тестирование
- Unit тесты для бизнес-логики
- Integration тесты для API
- Тесты базы данных

### Frontend тестирование
- Component тесты
- E2E тесты для пользовательских сценариев

## Документация API

- **Swagger UI** доступен по `/docs`
- **ReDoc** доступен по `/redoc`
- Автоматическая генерация из Pydantic схем 