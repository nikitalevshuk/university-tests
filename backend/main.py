"""
Главный модуль FastAPI приложения для системы психологического тестирования.

Настраивает:
- CORS для фронтенда
- Роутеры для API
- Обработчики событий запуска/остановки
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Импорт роутеров
from routers import auth, tests, users
from utils.exceptions import create_exception_handlers

# Загружаем переменные окружения
load_dotenv()

# Создаем экземпляр FastAPI
app = FastAPI(
    title="Психологическое тестирование",
    description="API для системы психологического тестирования студентов с JWT авторизацией",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
cors_origins = os.getenv("CORS_ORIGINS", 
    '["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "https://university-tests-pearl.vercel.app"]'
)

# Парсим строку JSON с origins
import json
try:
    origins_list = json.loads(cors_origins)
except json.JSONDecodeError:
    # Fallback на значения по умолчанию
    origins_list = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3001",  # React dev server альтернативный порт
        "http://127.0.0.1:3001",
        "http://localhost:8080",  # Webpack dev server
        "http://127.0.0.1:8080",
        "http://localhost:8000",  # Если фронтенд обращается к бэкенду на том же хосте
        "http://127.0.0.1:8000",
        # Docker контейнеры
        "http://frontend:3000",
        "http://backend:8000"
        # Vercel домены ДОЛЖНЫ быть указаны точно в переменной CORS_ORIGINS
        # "https://*.vercel.app" НЕ РАБОТАЕТ с credentials=True!
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,  # Важно для httpOnly cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Логируем настройки CORS для дебага
print(f"🌐 CORS origins configured: {origins_list}")

# Регистрируем обработчики исключений
create_exception_handlers(app)

# Подключение роутеров
app.include_router(auth.router)
app.include_router(tests.router)
app.include_router(users.router)

# Подключение статических файлов (если нужно)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "API системы психологического тестирования",
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check эндпоинт для Docker и мониторинга"""
    return {
        "status": "healthy",
        "service": "psycho-tests-backend",
        "message": "API работает корректно",
        "version": "2.0.0"
    }

# Событие запуска приложения
@app.on_event("startup")
async def startup_event():
    """Событие запуска приложения"""
    print("🚀 Запуск API системы психологического тестирования")
    print("📚 Документация доступна по адресу: /docs")

# Событие остановки приложения
@app.on_event("shutdown")
async def shutdown_event():
    """Событие остановки приложения"""
    print("🛑 Остановка API системы психологического тестирования")

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8000
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"🌐 Запуск сервера на {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    ) 