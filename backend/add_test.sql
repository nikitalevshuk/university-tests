-- SQL скрипт для добавления тестовой записи в таблицу tests

-- Проверяем, есть ли уже записи в таблице tests
SELECT COUNT(*) as test_count FROM tests;

-- Если записей нет, добавляем тест
INSERT INTO tests (filename, is_available, created_at) 
VALUES ('questions.json', true, NOW())
ON CONFLICT (filename) DO NOTHING;

-- Показываем все тесты
SELECT * FROM tests; 