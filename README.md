# Система Психологического Тестирования

Веб-приложение для проведения психологических тестов с аутентификацией пользователей, созданием и прохождением тестов.

## 🚀 Технологический стек

**Backend:**
- FastAPI 0.104.1 - современный Python веб-фреймворк
- SQLAlchemy 2.0.23 - ORM для работы с базой данных
- PostgreSQL - основная база данных
- JWT - аутентификация и авторизация
- Alembic - миграции базы данных
- bcrypt - хеширование паролей

**Frontend:**
- React 18.2.0 - библиотека для создания UI
- Vite 4.5.0 - сборщик и dev сервер
- Tailwind CSS 3.3.0 - CSS фреймворк
- React Router DOM 7.6.1 - маршрутизация
- Axios - HTTP клиент

**Инфраструктура:**
- Docker & Docker Compose - контейнеризация
- Nginx - веб-сервер для фронтенда
- GitHub Actions - CI/CD (планируется)

## 📁 Структура проекта

```
university-tests/
├── backend/              # FastAPI backend
│   ├── models/          # SQLAlchemy модели
│   ├── routers/         # API маршруты
│   ├── auth/            # Аутентификация
│   ├── database.py      # Настройка БД
│   ├── main.py          # Точка входа
│   └── requirements.txt # Python зависимости
├── frontend/            # React frontend
│   ├── public/          # Статические файлы
│   ├── src/             # Исходный код
│   │   ├── components/  # React компоненты
│   │   ├── services/    # API сервисы
│   │   └── utils/       # Утилиты
│   ├── package.json     # Node.js зависимости
│   └── vite.config.js   # Конфигурация Vite
├── database/            # Скрипты БД
├── docs/                # Документация
├── docker-compose.yml   # Docker конфигурация
└── Makefile            # Утилиты для разработки
```

## 🛠️ Установка и запуск

### Системные требования

- **Docker** 20.10+ и **Docker Compose** 2.0+
- **Make** (опционально, для удобства)
- Свободные порты: 3000, 8000, 5432

### Быстрый запуск

1. **Клонирование репозитория:**
```bash
git clone <repository-url>
cd university-tests
```

2. **Запуск с помощью Docker Compose:**
```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Или используя Makefile (если установлен make)
make up-build
```

3. **Проверка запуска:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs
- Swagger UI: http://localhost:8000/redoc

### Управление через Makefile

```bash
# Основные команды
make help        # Показать все доступные команды
make build       # Сборка контейнеров
make up          # Запуск проекта
make down        # Остановка проекта
make logs        # Просмотр логов
make restart     # Перезапуск

# Работа с базой данных
make migrate     # Применить миграции
make backup      # Создать бэкап БД
make restore backup=file.sql  # Восстановить из бэкапа

# Разработка и тестирование
make test        # Запуск тестов
make lint        # Проверка кода
make shell-backend  # Подключение к backend контейнеру

# Очистка
make clean       # Полная очистка Docker
make clean-images # Очистка образов
```

### Ручной запуск без Docker

<details>
<summary>Нажмите для просмотра инструкций</summary>

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Настройка переменных окружения
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
export SECRET_KEY="your-secret-key"

# Запуск сервера
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
</details>

## 🔒 Переменные окружения

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://psycho_user:psycho_password@postgres:5432/psycho_tests

# JWT
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=/api
VITE_APP_NAME="Психологическое тестирование" 
VITE_DEBUG=false
```

## 🗄️ База данных

**Структура:**
- `users` - пользователи системы
- `tests` - созданные тесты
- `test_results` - результаты прохождения тестов

**Миграции:**
```bash
# Применить все миграции
make migrate

# Создать новую миграцию
make makemigration msg="Описание изменений"
```

## 🔄 Основные API эндпоинты

### Аутентификация
- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `GET /auth/me` - Получение данных пользователя

### Тесты
- `GET /tests/` - Список всех тестов
- `POST /tests/` - Создание нового теста
- `GET /tests/{test_id}` - Получение конкретного теста
- `PUT /tests/{test_id}` - Обновление теста
- `DELETE /tests/{test_id}` - Удаление теста

### Результаты
- `POST /tests/{test_id}/submit` - Отправка результатов теста
- `GET /results/` - История результатов пользователя

Полная документация API доступна по адресу: http://localhost:8000/docs

## 🎨 Особенности UI

- **Адаптивный дизайн** - работает на всех устройствах
- **Современный интерфейс** - использует Tailwind CSS
- **SPA архитектура** - быстрая навигация без перезагрузки страниц
- **Темная/светлая тема** - автоматическое переключение
- **Валидация форм** - клиентская и серверная проверка данных

## 🧪 Тестирование

```bash
# Backend тесты
make test

# Frontend тесты  
make test-frontend

# Проверка кода
make lint
make format
```

## 🚀 Деплой

### Docker Production

```bash
# Сборка production образов
docker-compose -f docker-compose.yml build

# Запуск в production режиме
docker-compose -f docker-compose.yml up -d
```

### Переменные для продакшена

1. Смените `SECRET_KEY` на криптостойкий ключ
2. Установите `DEBUG=false`
3. Настройте правильные `CORS_ORIGINS`
4. Используйте внешнюю PostgreSQL для продакшена
5. Настройте SSL сертификаты для HTTPS

## 📚 Документация

Полная документация проекта находится в папке `docs/`:

- [Архитектура системы](docs/architecture.md)
- [Настройка и установка](docs/setup.md)
- [Backend API](backend/docs/api.md)
- [Модели данных](backend/docs/models.md)
- [Аутентификация](backend/docs/auth.md)
- [Frontend компоненты](frontend/docs/components.md)
- [API сервисы](frontend/docs/services.md)
- [Полный индекс документации](docs/docs-index.md)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🆘 Поддержка

Если у вас возникли проблемы:

1. Проверьте [документацию](docs/)
2. Просмотрите [Issues](issues) на GitHub
3. Создайте новый Issue с подробным описанием проблемы

## 📈 Планы развития

- [ ] Система ролей и разрешений
- [ ] Расширенная аналитика результатов
- [ ] Экспорт результатов в PDF/Excel
- [ ] Система уведомлений
- [ ] Мобильное приложение
- [ ] Интеграция с внешними системами 