# Dockerfile для деплоя Backend из корневой директории проекта
# Предназначен для Railway и других платформ, где деплой ведется из корня репозитория

FROM python:3.11-slim

# Метаданные
LABEL maintainer="Psycho Tests Team"
LABEL description="FastAPI backend for psychological testing system (root deployment)"
LABEL version="1.0.0"

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создание рабочей директории
WORKDIR /app

# Копирование requirements.txt из директории backend
COPY backend/requirements.txt .

# Обновление pip и установка Python зависимостей
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Создание пользователя для безопасности (не root) после установки пакетов
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Копирование всего кода backend в рабочую директорию
COPY backend/ .

# Изменение владельца файлов на appuser
RUN chown -R appuser:appgroup /app

# Переключение на непривилегированного пользователя
USER appuser

# Экспорт порта
EXPOSE 8000

# Переменные окружения по умолчанию
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Команда запуска
# Сначала инициализируем БД, затем запускаем приложение
CMD ["sh", "-c", "python init_database.py && uvicorn main:app --host 0.0.0.0 --port 8000"] 