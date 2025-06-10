# Railway Deployment Commands

## 🎯 **Точные команды и настройки для Railway**

### **1. PostgreSQL Database Service**

**Создание сервиса:**
```
Service Type: Database
Database Type: PostgreSQL
Name: psycho-tests-db
```

**Настройки:**
- Version: PostgreSQL 16
- Storage: 1GB (для начала)
- Automatic backups: Enabled

**Получение credentials:**
После создания БД Railway автоматически создаст переменную `DATABASE_URL`

---

### **2. Backend Service (FastAPI)**

**Создание сервиса:**
```
Service Type: Web Service
Source: Git Repository
Name: psycho-tests-backend
```

**Repository Settings:**
```
Repository: [your-git-repo]
Branch: main
Root Directory: backend
```

**Build Settings:**
```
Builder: Dockerfile
Dockerfile Path: backend/Dockerfile
```

**Deploy Settings:**
```
Start Command: python init_database.py && uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**
```bash
# Database (Reference from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Settings  
SECRET_KEY=generate-random-256-bit-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# Server Settings
HOST=0.0.0.0
PORT=${{PORT}}
DEBUG=false

# CORS Settings (update after frontend deployment)
CORS_ORIGINS=["https://${{RAILWAY_STATIC_URL}}"]
```

**Health Check:**
```
Path: /health
```

---

### **3. Frontend Service (React + Nginx)**

**Создание сервиса:**
```
Service Type: Web Service
Source: Git Repository  
Name: psycho-tests-frontend
```

**Repository Settings:**
```
Repository: [your-git-repo]
Branch: main
Root Directory: frontend
```

**Build Settings:**
```
Builder: Dockerfile
Dockerfile Path: frontend/Dockerfile
Build Args:
  VITE_API_BASE_URL: ${{psycho-tests-backend.url}}
  VITE_APP_NAME: "Психологическое тестирование"
  VITE_DEBUG: false
```

**Deploy Settings:**
```
Start Command: nginx -g 'daemon off;'
```

**Health Check:**
```
Path: /nginx-health
```

---

## 🔄 **Порядок развертывания**

### **Шаг 1: База данных**
1. Создать PostgreSQL database service
2. Дождаться готовности БД
3. Записать `DATABASE_URL`

### **Шаг 2: Backend**
1. Создать backend web service
2. Настроить environment variables
3. Задеплоить
4. Проверить `/health` endpoint
5. Записать URL backend'а

### **Шаг 3: Frontend** 
1. Создать frontend web service
2. Настроить build args с URL backend'а
3. Задеплоить
4. Проверить работу приложения

### **Шаг 4: Финальная настройка**
1. Обновить CORS_ORIGINS в backend с URL frontend'а
2. Переделать деплой backend
3. Протестировать полный flow

---

## 📋 **Checklist для деплоя**

### **Pre-deployment:**
- [ ] Все Dockerfile'ы тестированы локально
- [ ] Файл `backend/questions.json` присутствует в репозитории
- [ ] Файл `backend/init_database.py` готов
- [ ] Frontend nginx.conf настроен правильно

### **Database:**
- [ ] PostgreSQL service создан
- [ ] DATABASE_URL доступна
- [ ] Подключение к БД работает

### **Backend:**
- [ ] Git repository подключен
- [ ] Environment variables настроены
- [ ] Start command правильный
- [ ] Health check работает (`/health`)
- [ ] API documentation доступна (`/docs`)

### **Frontend:**
- [ ] Git repository подключен  
- [ ] Build args с backend URL настроены
- [ ] Nginx запускается
- [ ] Health check работает (`/nginx-health`)
- [ ] Статические файлы отдаются

### **Integration:**
- [ ] Frontend может обращаться к backend
- [ ] CORS настроен правильно
- [ ] Регистрация работает
- [ ] Тесты загружаются
- [ ] Полный flow функционирует

---

## 🛠 **Railway CLI Commands (альтернативный способ)**

### **Установка Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

### **Создание проекта:**
```bash
railway new psycho-tests
cd psycho-tests
```

### **Деплой backend:**
```bash
# В папке проекта
railway service create --name backend
railway environment set DATABASE_URL="postgresql://..."
railway environment set SECRET_KEY="your-secret-key"
railway environment set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway environment set ALGORITHM=HS256
railway environment set HOST=0.0.0.0
railway environment set DEBUG=false

# Связать с Git и задеплоить
railway connect [repo-url]
railway up --service backend --path ./backend
```

### **Деплой frontend:**
```bash
railway service create --name frontend
railway environment set VITE_API_BASE_URL="https://backend-url.railway.app"
railway up --service frontend --path ./frontend
```

---

## 🔍 **Debugging Commands**

### **Просмотр логов:**
```bash
# Backend logs
railway logs --service backend

# Frontend logs  
railway logs --service frontend

# Database logs
railway logs --service postgres
```

### **Проверка переменных окружения:**
```bash
railway variables --service backend
railway variables --service frontend
```

### **Подключение к базе данных:**
```bash
railway connect postgres
```

---

## 🎉 **Проверка после деплоя**

### **Health Checks:**
```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend health  
curl https://your-frontend.railway.app/nginx-health

# API docs
open https://your-backend.railway.app/docs
```

### **Functional Testing:**
```bash
# Test registration
curl -X POST "https://your-backend.railway.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Тест", "last_name": "Пользователь", "middle_name": "Тестович", "faculty": "ФИБ", "course": 1, "password": "testpassword123"}'

# Test available tests
curl https://your-backend.railway.app/tests/available
```

---

## 📝 **Важные файлы для Railway**

**Обязательные файлы в репозитории:**
- `backend/Dockerfile` ✅
- `backend/init_database.py` ✅  
- `backend/questions.json` ✅
- `frontend/Dockerfile` ✅
- `frontend/nginx.conf` ✅

**Конфигурационные файлы:**
- `backend/requirements.txt` ✅
- `frontend/package.json` ✅
- `RAILWAY_MIGRATION_PLAN.md` ✅
- `RAILWAY_DEPLOY.md` ✅

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Backend не стартует:**
   - Проверить DATABASE_URL
   - Проверить логи: `railway logs --service backend`
   - Убедиться что init_database.py выполнился

2. **Frontend не может подключиться к backend:**
   - Проверить VITE_API_BASE_URL в build args
   - Проверить CORS_ORIGINS в backend
   - Убедиться что backend отвечает

3. **База данных не инициализируется:**
   - Проверить что PostgreSQL service запущен
   - Запустить `python init_database.py` вручную
   - Проверить права доступа к БД

### **Полезные команды:**
```bash
# Restart service
railway service restart --name backend

# Rebuild service  
railway service rebuild --name frontend

# Check service status
railway status
``` 