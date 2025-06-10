# План миграции с Docker Compose на Railway

## 📋 **Анализ текущей архитектуры**

### Текущие сервисы в docker-compose.yml:

1. **PostgreSQL Database** (`postgres`)
   - Образ: `postgres:16-alpine`
   - Порт: 5432
   - Volume: `postgres_data`
   - Инициализация: `database/init.sql`

2. **FastAPI Backend** (`backend`)
   - Dockerfile: `backend/Dockerfile`
   - Порт: 8000
   - Зависит от: postgres
   - Health check: `/health`

3. **React Frontend** (`frontend`)
   - Dockerfile: `frontend/Dockerfile`
   - Порт: 3000
   - Зависит от: backend
   - Nginx + React SPA

### Переменные окружения и связи:
- Backend → PostgreSQL: `DATABASE_URL`
- Frontend → Backend: `/api` (через nginx proxy)
- CORS настройки для связи frontend ↔ backend

---

## 🚀 **План миграции на Railway**

### **Этап 1: Подготовка к миграции**

#### 1.1 Обновление Dockerfile'ов
✅ **Backend Dockerfile** - готов
- Использует переменные окружения
- Имеет health check
- Правильно настроен для продакшена

✅ **Frontend Dockerfile** - готов
- Многоэтапная сборка
- Nginx конфигурация
- Build args для API URL

#### 1.2 Создание Railway-специфичных файлов
✅ **Готово:**
- `backend/init_database.py` - инициализация БД
- `RAILWAY_DEPLOY.md` - инструкции деплоя
- `backend/questions.json` - данные тестов

---

## 🎯 **Этап 2: Railway Configuration**

### **2.1 Создание сервисов на Railway**

#### **Сервис 1: PostgreSQL Database**
```
Тип: Database (Managed PostgreSQL)
Преимущества:
- Автоматические бэкапы
- Масштабирование
- Мониторинг
- Высокая доступность
```

#### **Сервис 2: Backend (FastAPI)**
```
Источник: Git Repository
Working Directory: backend
Dockerfile: backend/Dockerfile
Port: 8000
```

#### **Сервис 3: Frontend (React + Nginx)**
```
Источник: Git Repository  
Working Directory: frontend
Dockerfile: frontend/Dockerfile
Port: 3000
```

### **2.2 Переменные окружения**

#### **Backend Environment Variables:**
```bash
# Database (автоматически от Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Settings
SECRET_KEY=your-super-secret-jwt-key-change-in-production-RANDOM-STRING
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# Server Settings
HOST=0.0.0.0
PORT=${{PORT}}
DEBUG=false

# CORS (обновить с реальными доменами)
CORS_ORIGINS=["https://${{RAILWAY_STATIC_URL}}", "https://your-frontend-domain.railway.app"]
```

#### **Frontend Build Arguments:**
```bash
# Railway автоматически определит backend URL
VITE_API_BASE_URL=https://your-backend-domain.railway.app
VITE_APP_NAME=Психологическое тестирование
VITE_DEBUG=false
```

### **2.3 Start Commands**

#### **Backend:**
```bash
python init_database.py && uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### **Frontend:**
```bash
nginx -g 'daemon off;'
```

---

## 🔧 **Этап 3: Локальное тестирование**

### **3.1 Тестирование отдельных Dockerfile'ов**

#### Backend:
```bash
# Сборка
docker build -t psycho-backend ./backend

# Запуск (с внешней БД)
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e SECRET_KEY="test-secret" \
  psycho-backend
```

#### Frontend:
```bash
# Сборка
docker build -t psycho-frontend \
  --build-arg VITE_API_BASE_URL=http://localhost:8000 \
  ./frontend

# Запуск
docker run -p 3000:3000 psycho-frontend
```

### **3.2 Тестирование связи сервисов**
```bash
# Создание docker network
docker network create psycho-test

# Запуск PostgreSQL
docker run -d --name postgres --network psycho-test \
  -e POSTGRES_DB=psycho_tests \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  postgres:16-alpine

# Запуск Backend
docker run -d --name backend --network psycho-test \
  -e DATABASE_URL="postgresql://test_user:test_pass@postgres:5432/psycho_tests" \
  -e SECRET_KEY="test-secret" \
  -p 8000:8000 psycho-backend

# Запуск Frontend
docker run -d --name frontend --network psycho-test \
  -p 3000:3000 psycho-frontend
```

---

## 📝 **Этап 4: Railway Deployment Steps**

### **4.1 Порядок деплоя**

1. **PostgreSQL Database**
   - Создать Managed PostgreSQL на Railway
   - Записать `DATABASE_URL`

2. **Backend Service**
   - Connect Git Repository
   - Set Working Directory: `backend`
   - Configure Environment Variables
   - Deploy

3. **Frontend Service**
   - Connect Git Repository
   - Set Working Directory: `frontend`
   - Set Build Args с URL backend'а
   - Deploy

### **4.2 Конфигурация Railway**

#### **Backend Service Settings:**
```yaml
service: backend
build:
  builder: DOCKERFILE
  dockerfilePath: backend/Dockerfile
deploy:
  startCommand: python init_database.py && uvicorn main:app --host 0.0.0.0 --port $PORT
  healthcheckPath: /health
variables:
  SECRET_KEY: [GENERATE_RANDOM]
  ACCESS_TOKEN_EXPIRE_MINUTES: 30
  ALGORITHM: HS256
  HOST: 0.0.0.0
  DEBUG: false
```

#### **Frontend Service Settings:**
```yaml
service: frontend  
build:
  builder: DOCKERFILE
  dockerfilePath: frontend/Dockerfile
  buildArgs:
    VITE_API_BASE_URL: ${{backend.url}}
    VITE_APP_NAME: "Психологическое тестирование"
    VITE_DEBUG: false
deploy:
  startCommand: nginx -g 'daemon off;'
  healthcheckPath: /nginx-health
```

---

## ✅ **Этап 5: Проверка и тестирование**

### **5.1 Health Checks**
- Backend: `GET https://backend-domain.railway.app/health`
- Frontend: `GET https://frontend-domain.railway.app/nginx-health`
- Database: Через Railway Dashboard

### **5.2 Функциональное тестирование**
1. Регистрация пользователя
2. Авторизация
3. Получение списка тестов
4. Прохождение теста
5. Просмотр результатов

### **5.3 API Documentation**
- Swagger UI: `https://backend-domain.railway.app/docs`
- ReDoc: `https://backend-domain.railway.app/redoc`

---

## 🔄 **Сравнение: До и После**

| Аспект | Docker Compose | Railway |
|--------|----------------|---------|
| **Деплой** | Один файл, локальный сервер | Отдельные сервисы, облако |
| **База данных** | PostgreSQL контейнер | Managed PostgreSQL |
| **Масштабирование** | Ручное | Автоматическое |
| **Мониторинг** | Ручное | Встроенное |
| **Бэкапы** | Ручные | Автоматические |
| **Связь сервисов** | Docker network | Private networking |
| **SSL/TLS** | Ручная настройка | Автоматические сертификаты |
| **CI/CD** | Ручное | Git-based auto-deploy |

---

## 🛠 **Дополнительные рекомендации**

### **Безопасность:**
- Сгенерировать случайный `SECRET_KEY`
- Настроить правильные CORS origins
- Использовать HTTPS в продакшене

### **Производительность:**
- Настроить connection pooling для БД
- Использовать Redis для кеширования (опционально)
- Оптимизировать размеры Docker образов

### **Мониторинг:**
- Настроить логирование в Railway
- Использовать health checks
- Мониторить метрики производительности

---

## 🎉 **Результат**

После миграции получаем:
- ✅ Раздельные, независимые сервисы
- ✅ Managed база данных с автобэкапами
- ✅ Автоматический деплой из Git
- ✅ Масштабирование по потребности
- ✅ Встроенный мониторинг и логи
- ✅ Автоматические SSL сертификаты 