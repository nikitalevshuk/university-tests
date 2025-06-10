# Makefile для проекта Психологического тестирования
# Упрощает работу с Docker командами

.PHONY: help build up down logs clean restart test backup restore

# Переменные
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = psycho-tests

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  build     - Сборка всех контейнеров"
	@echo "  up        - Запуск проекта"
	@echo "  down      - Остановка всех контейнеров"
	@echo "  logs      - Просмотр логов всех сервисов"
	@echo "  restart   - Перезапуск всех контейнеров"
	@echo "  clean     - Полная очистка (контейнеры, образы, volumes)"
	@echo "  test      - Запуск тестов"
	@echo "  backup    - Создание бэкапа базы данных"
	@echo "  restore   - Восстановление базы данных из бэкапа"

# Сборка всех контейнеров
build:
	@echo "🔨 Сборка контейнеров..."
	docker-compose -f $(COMPOSE_FILE) build

# Сборка без кеша
build-no-cache:
	@echo "🔨 Сборка контейнеров без кеша..."
	docker-compose -f $(COMPOSE_FILE) build --no-cache

# Запуск проекта
up:
	@echo "🚀 Запуск проекта..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Проект запущен!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Запуск с пересборкой
up-build:
	@echo "🔨 Сборка и запуск проекта..."
	docker-compose -f $(COMPOSE_FILE) up -d --build

# Остановка контейнеров
down:
	@echo "⏹️ Остановка контейнеров..."
	docker-compose -f $(COMPOSE_FILE) down

# Остановка с удалением volumes
down-volumes:
	@echo "⏹️ Остановка контейнеров с удалением volumes..."
	docker-compose -f $(COMPOSE_FILE) down -v

# Перезапуск
restart:
	@echo "🔄 Перезапуск контейнеров..."
	$(MAKE) down
	$(MAKE) up

# Просмотр логов
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Логи конкретного сервиса
logs-backend:
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend:
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

logs-postgres:
	docker-compose -f $(COMPOSE_FILE) logs -f postgres

# Выполнение команд в контейнерах
shell-backend:
	docker-compose -f $(COMPOSE_FILE) exec backend bash

shell-frontend:
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-postgres:
	docker-compose -f $(COMPOSE_FILE) exec postgres psql -U psycho_user -d psycho_tests

# Миграции базы данных
migrate:
	docker-compose -f $(COMPOSE_FILE) exec backend alembic upgrade head

# Создание таблиц (альтернатива миграциям)
create-tables:
	docker-compose -f $(COMPOSE_FILE) exec backend python create_tables.py

# Полная инициализация БД (для Railway)
init-database:
	docker-compose -f $(COMPOSE_FILE) exec backend python init_database.py

# Создание новой миграции
makemigration:
	docker-compose -f $(COMPOSE_FILE) exec backend alembic revision --autogenerate -m "$(msg)"

# Тестирование
test:
	@echo "🧪 Запуск тестов..."
	docker-compose -f $(COMPOSE_FILE) exec backend python -m pytest

test-frontend:
	docker-compose -f $(COMPOSE_FILE) exec frontend npm test

# Статический анализ кода
lint:
	docker-compose -f $(COMPOSE_FILE) exec backend python -m flake8 .
	docker-compose -f $(COMPOSE_FILE) exec frontend npm run lint

# Форматирование кода
format:
	docker-compose -f $(COMPOSE_FILE) exec backend python -m black .
	docker-compose -f $(COMPOSE_FILE) exec frontend npm run format

# Мониторинг и статус
status:
	@echo "📊 Статус контейнеров:"
	docker-compose -f $(COMPOSE_FILE) ps

health:
	@echo "🏥 Проверка здоровья сервисов:"
	@echo "Backend:"
	@curl -f http://localhost:8000/health || echo "❌ Backend недоступен"
	@echo "Frontend:"
	@curl -f http://localhost:3000/nginx-health || echo "❌ Frontend недоступен"

# Бэкап базы данных
backup:
	@echo "💾 Создание бэкапа базы данных..."
	mkdir -p backups
	docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U psycho_user psycho_tests > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Бэкап создан в папке backups/"

# Восстановление из бэкапа
restore:
	@echo "🔄 Восстановление из бэкапа $(backup)..."
	@if [ -z "$(backup)" ]; then echo "❌ Укажите файл бэкапа: make restore backup=backups/backup_file.sql"; exit 1; fi
	docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U psycho_user psycho_tests < $(backup)
	@echo "✅ База данных восстановлена"

# Очистка
clean:
	@echo "🧹 Полная очистка..."
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans
	docker system prune -f
	@echo "✅ Очистка завершена"

# Очистка образов
clean-images:
	@echo "🧹 Удаление неиспользуемых образов..."
	docker image prune -f

# Очистка volumes
clean-volumes:
	@echo "🧹 Удаление неиспользуемых volumes..."
	docker volume prune -f

# Информация о проекте
info:
	@echo "📋 Информация о проекте:"
	@echo "Project: $(PROJECT_NAME)"
	@echo "Compose file: $(COMPOSE_FILE)"
	@echo "Services: backend, frontend, postgres"
	@echo "Ports:"
	@echo "  - Frontend: 3000"
	@echo "  - Backend: 8000"
	@echo "  - PostgreSQL: 5432" 