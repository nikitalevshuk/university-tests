# Frontend Dockerfile для React приложения
# Многоэтапная сборка для оптимизации размера образа

# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

# Метаданные
LABEL maintainer="Psycho Tests Team"
LABEL description="React frontend for psychological testing system"

# Установка системных зависимостей
RUN apk add --no-cache libc6-compat

# Создание рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка всех зависимостей (включая devDependencies для сборки)
RUN npm ci --silent

# Копирование исходного кода
COPY . .

# Сборка приложения для продакшена
RUN npm run build

# Этап 2: Продакшен образ с nginx
FROM nginx:alpine AS production

# Установка дополнительных пакетов
RUN apk add --no-cache curl

# Удаление стандартной конфигурации nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копирование собранного приложения из builder этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Изменение владельца файлов
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Создание директории для PID файла nginx
RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Переключение на непривилегированного пользователя
USER nextjs

# Экспорт порта
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/nginx-health || exit 1

# Команда запуска nginx
CMD ["nginx", "-g", "daemon off;"] 