# Инструкция по установке и запуску

## Системные требования

### Необходимое ПО
- **Python** 3.8+ (рекомендуется 3.10+)
- **Node.js** 16+ и npm
- **PostgreSQL** 12+
- **Git**

### Операционные системы
- macOS (текущий: darwin 24.5.0)
- Linux (Ubuntu, CentOS, etc.)
- Windows 10/11

## Установка проекта

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd university-tests
```

### 2. Настройка Backend

#### 2.1. Создание виртуального окружения
```bash
# Создание виртуального окружения
python -m venv .venv

# Активация (macOS/Linux)
source .venv/bin/activate

# Активация (Windows)
# .venv\Scripts\activate
```

#### 2.2. Установка зависимостей Python
```bash
cd backend
pip install -r requirements.txt
```

#### 2.3. Настройка базы данных PostgreSQL

**Создание базы данных:**
```sql
-- Подключение к PostgreSQL
psql -U postgres

-- Создание базы данных
CREATE DATABASE psycho_tests;

-- Создание пользователя (опционально)
CREATE USER psycho_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE psycho_tests TO psycho_user;
```

#### 2.4. Настройка переменных окружения

Создайте файл `.env` в папке `backend/`:
```bash
# Backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/psycho_tests
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# Настройки сервера
HOST=127.0.0.1
PORT=8000
DEBUG=True

# Настройки CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

**Генерация SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.5. Инициализация базы данных

```bash
# Инициализация Alembic (если еще не сделано)
alembic init alembic

# Создание первой миграции
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

### 3. Настройка Frontend

#### 3.1. Установка зависимостей Node.js
```bash
cd ../frontend
npm install
```

#### 3.2. Настройка переменных окружения (опционально)

Создайте файл `.env.local` в папке `frontend/`:
```bash
# Frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000
```

## Запуск приложения

### Режим разработки

#### 1. Запуск Backend сервера
```bash
# В папке backend (виртуальное окружение должно быть активно)
cd backend
python main.py

# Или через uvicorn напрямую
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend будет доступен по адресу: http://localhost:8000

**Проверка работы:**
- Корневой эндпоинт: http://localhost:8000/
- Health check: http://localhost:8000/health
- API документация: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 2. Запуск Frontend сервера
```bash
# В новом терминале, в папке frontend
cd frontend
npm run dev
```

Frontend будет доступен по адресу: http://localhost:5173

### Одновременный запуск

Для удобства разработки можете создать скрипт запуска обеих частей:

**start.sh (macOS/Linux):**
```bash
#!/bin/bash

# Запуск backend в фоне
cd backend
source ../.venv/bin/activate
python main.py &
BACKEND_PID=$!

# Запуск frontend в фоне
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Для остановки нажмите Ctrl+C"

# Ожидание прерывания
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

```bash
chmod +x start.sh
./start.sh
```

## Проверка установки

### 1. Проверка Backend
```bash
# Проверка здоровья API
curl http://localhost:8000/health

# Ожидаемый ответ:
# {"status":"healthy","message":"API работает корректно","version":"2.0.0"}
```

### 2. Проверка Frontend
Откройте браузер и перейдите на http://localhost:5173

### 3. Проверка подключения к БД
```bash
# В папке backend
python check_users.py
```

## Режим продакшн

### Backend
```bash
# С минимальными логами
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level warning

# Или с gunicorn для production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Сборка для продакшн
npm run build

# Сервировка статических файлов
npm install -g serve
serve -s dist -l 3000
```

## Решение проблем

### Частые ошибки

#### 1. Ошибка подключения к БД
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Решение:**
- Проверьте, что PostgreSQL запущен
- Проверьте параметры подключения в `.env`
- Убедитесь, что база данных существует

#### 2. Ошибка CORS
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:**
- Проверьте настройки CORS в `main.py`
- Убедитесь, что frontend URL добавлен в `allow_origins`

#### 3. Ошибка миграций
```
alembic.util.exc.CommandError: Can't locate revision identified by
```

**Решение:**
```bash
# Сброс миграций
alembic downgrade base
alembic upgrade head
```

#### 4. Ошибка npm зависимостей
```
npm ERR! peer dep missing
```

**Решение:**
```bash
# Очистка кеша npm
npm cache clean --force

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

### Логи для отладки

#### Backend логи
```bash
# Подробные логи uvicorn
uvicorn main:app --log-level debug

# Логи SQLAlchemy
# Добавьте в main.py:
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

#### Frontend логи
Откройте Developer Tools в браузере (F12) → Console

### Полезные команды

```bash
# Проверка портов
lsof -i :8000  # Backend
lsof -i :5173  # Frontend

# Остановка процессов
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:5173)

# Проверка статуса БД
pg_ctl status -D /usr/local/var/postgres
```

## Дополнительные инструменты

### Рекомендуемые IDE расширения

**VS Code:**
- Python
- Pylance
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- REST Client

**PyCharm/WebStorm:**
- Встроенная поддержка Python/JavaScript
- Database tools
- HTTP Client

### Инструменты отладки

- **Backend:** FastAPI автоматически предоставляет Swagger UI
- **Frontend:** React DevTools
- **API:** Postman или Insomnia для тестирования API
- **База данных:** pgAdmin или DBeaver 