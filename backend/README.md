# Backend - Система психологического тестирования

Бэкенд для системы психологического тестирования, построенный на FastAPI с использованием PostgreSQL и Alembic для миграций.

## Требования

- Python 3.8+
- PostgreSQL 12+
- pip

## Установка и настройка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd psycho_tests/backend
```

### 2. Создание виртуального окружения
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

### 3. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения
Создайте файл `.env` в папке backend:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/psycho_tests_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=psycho_tests_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Security
SECRET_KEY=your_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
HOST=127.0.0.1
PORT=8000
```

### 5. Настройка базы данных

#### Создание базы данных PostgreSQL:
```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE psycho_tests_db;

# Установите пароль для пользователя postgres (если нужно)
ALTER USER postgres PASSWORD 'password';

# Выйдите из psql
\q
```

#### Инициализация миграций:
Миграции уже настроены. Для применения:

```bash
# Активируйте виртуальное окружение
.venv\Scripts\activate

# Примените миграции
python migrate.py upgrade
```

### 6. Запуск сервера разработки

```bash
# Убедитесь, что виртуальное окружение активировано
.venv\Scripts\activate

# Запустите сервер
python main.py
# или
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Работа с миграциями

Для удобства создан скрипт `migrate.py`:

```bash
# Показать текущую ревизию
python migrate.py current

# Показать историю миграций
python migrate.py history

# Создать новую миграцию
python migrate.py create "Описание изменений"

# Применить все миграции
python migrate.py upgrade

# Откатить миграции
python migrate.py downgrade [ревизия]
```

### Альтернативные команды Alembic:
```bash
# Установите переменную окружения для пароля PostgreSQL
$env:PGPASSWORD="password"

# Создание миграции
alembic revision --autogenerate -m "Описание изменений"

# Применение миграций
alembic upgrade head

# Откат миграций
alembic downgrade -1

# Просмотр текущей ревизии
alembic current

# История миграций
alembic history
```

## API Документация

После запуска сервера документация доступна по адресам:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Структура проекта

```
backend/
├── alembic/                 # Конфигурация и миграции Alembic
│   ├── versions/           # Файлы миграций
│   ├── env.py             # Настройки окружения Alembic
│   └── script.py.mako     # Шаблон для миграций
├── auth/                   # Модули аутентификации
│   ├── jwt_handler.py     # Обработка JWT токенов
│   └── password.py        # Хеширование паролей
├── db/                     # Конфигурация базы данных
│   └── database.py        # Настройки SQLAlchemy
├── models/                 # Модели данных
│   ├── user.py           # Модель пользователя
│   ├── test.py           # Модель теста
│   └── test_progress.py  # Модель прогресса теста
├── routers/               # API маршруты
│   ├── auth.py           # Аутентификация
│   ├── tests.py          # Управление тестами
│   └── user_tests.py     # Пользовательские тесты
├── schemas/               # Pydantic схемы
│   ├── auth.py           # Схемы аутентификации
│   ├── test.py           # Схемы тестов
│   └── user.py           # Схемы пользователей
├── utils/                 # Утилиты
│   └── exceptions.py     # Обработка исключений
├── alembic.ini           # Конфигурация Alembic
├── main.py               # Главный файл приложения
├── migrate.py            # Скрипт для управления миграциями
├── requirements.txt      # Зависимости Python
└── .env                  # Переменные окружения
```

## Модели данных

### User (Пользователь)
- `id`: Уникальный идентификатор
- `first_name`: Имя
- `last_name`: Фамилия  
- `middle_name`: Отчество
- `faculty`: Факультет (enum)
- `course`: Курс (enum)
- `password_hash`: Хеш пароля
- `created_at`: Дата создания
- `completed_tests`: JSON с результатами тестов

### Test (Тест)
- `id`: Уникальный идентификатор
- `title`: Название теста
- `description`: Описание
- `filename`: Имя JSON файла с вопросами
- `is_available`: Доступность теста
- `created_at`: Дата создания

### TestProgress (Прогресс теста)
- `id`: Уникальный идентификатор
- `user_id`: ID пользователя
- `test_id`: ID теста
- `current_question_index`: Текущий вопрос
- `answers`: JSON с ответами
- `started_at`: Время начала

## Разработка

### Запуск в режиме разработки:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Создание новых миграций:
```bash
python migrate.py create "Описание изменений"
```

### Логирование:
Установите уровень логирования в `.env`:
```env
DEBUG=True
```

## Безопасность

- JWT токены хранятся в httpOnly cookies
- Пароли хешируются с помощью bcrypt
- CORS настроен для фронтенда
- Валидация данных через Pydantic

## Лицензия

MIT License 