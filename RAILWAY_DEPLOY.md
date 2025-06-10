# Деплой на Railway

## Команды для инициализации базы данных

### Главная команда (рекомендуемая)
```bash
python init_database.py
```

### Альтернативные команды (по отдельности)
```bash
# 1. Создание таблиц
python create_tables.py

# 2. Добавление начального теста
python add_test.py
```

## Переменные окружения для Railway

Убедитесь, что установлены следующие переменные:

```
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS=["https://your-frontend-domain.railway.app"]
```

## Порядок запуска на Railway

1. **Backend (FastAPI)**:
   - Dockerfile: `backend/Dockerfile`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python init_database.py && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Working Directory: `backend`

2. **Frontend (React)**:
   - Dockerfile: `frontend/Dockerfile`
   - Build Command: `npm ci && npm run build`
   - Start Command: `nginx -g 'daemon off;'`
   - Working Directory: `frontend`

## Важные файлы для инициализации БД

- `backend/init_database.py` - **Главный файл инициализации**
- `backend/create_tables.py` - Создание таблиц
- `backend/add_test.py` - Добавление тестов
- `backend/questions.json` - Данные теста (скопированы из frontend/public/)

## Проверка после деплоя

1. Проверьте health endpoint: `GET /health`
2. Проверьте API документацию: `GET /docs`
3. Проверьте доступные тесты: `GET /tests/available`

## Troubleshooting

Если база данных не инициализировалась:
1. Проверьте логи Railway
2. Убедитесь что DATABASE_URL корректная
3. Запустите `python init_database.py` вручную через Railway CLI 