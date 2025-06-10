-- Файл инициализации базы данных PostgreSQL
-- Выполняется автоматически при первом запуске контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Комментарии к базе данных
COMMENT ON DATABASE psycho_tests IS 'База данных для системы психологического тестирования';

-- Создание дополнительных схем (при необходимости)
-- CREATE SCHEMA IF NOT EXISTS public;

-- Настройка прав доступа
GRANT ALL PRIVILEGES ON DATABASE psycho_tests TO psycho_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO psycho_user;

-- Установка часового пояса по умолчанию
SET timezone = 'UTC';

-- Вывод информации об инициализации
SELECT 'Database psycho_tests initialized successfully' as status; 