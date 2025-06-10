# Dockerfile для Backend (корневая директория)

## Описание
Этот `Dockerfile` размещен в корневой директории проекта и предназначен для деплоя backend'а из корня репозитория. Особенно полезен для платформ вроде Railway, Heroku, где деплой ведется из корня.

## Отличия от backend/Dockerfile

| Аспект | backend/Dockerfile | Dockerfile (корень) |
|--------|-------------------|-------------------|
| Расположение | `backend/Dockerfile` | `./Dockerfile` |
| Контекст сборки | `backend/` | Корень проекта |
| Пути к файлам | `COPY requirements.txt .` | `COPY backend/requirements.txt .` |
| Копирование кода | `COPY . .` | `COPY backend/ .` |
| Использование | Docker Compose | Railway/Heroku/etc |

## Использование

### Локальная сборка из корня проекта:
```bash
# Сборка образа
docker build -t psycho-backend-root -f Dockerfile .

# Запуск контейнера
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e SECRET_KEY="your-secret-key" \
  psycho-backend-root
```

### Railway деплой:
1. Railway автоматически обнаружит `Dockerfile` в корне
2. Настройте переменные окружения в Railway UI:
   - `DATABASE_URL` - ссылка на PostgreSQL сервис
   - `SECRET_KEY` - секретный ключ для JWT
   - `CORS_ORIGINS` - URL фронтенда

### Heroku деплой:
```bash
# Логин в Heroku
heroku login

# Создание приложения 
heroku create your-app-name

# Деплой
git push heroku main
```

## Особенности

### Автоматическая инициализация БД
Dockerfile включает команду `python init_database.py` для создания таблиц при запуске.

### Health Check
Встроенная проверка здоровья приложения на endpoint `/health`.

### Безопасность
- Использует непривилегированного пользователя `appuser`
- Минимальный базовый образ `python:3.11-slim`

### Environment Variables
```bash
PYTHONPATH=/app            # Путь к Python модулям
PYTHONUNBUFFERED=1         # Небуферизованный вывод
```

## Порты
- **8000** - HTTP API сервер (FastAPI + Uvicorn)

## Структура после сборки
```
/app/
├── main.py              # Точка входа FastAPI
├── init_database.py     # Скрипт инициализации БД
├── requirements.txt     # Python зависимости
├── models/             # SQLAlchemy модели
├── routers/            # API роутеры
├── utils/              # Утилиты
└── questions.json      # Тестовые данные
``` 