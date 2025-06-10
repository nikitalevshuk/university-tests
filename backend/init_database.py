#!/usr/bin/env python3
"""
Комплексный скрипт инициализации базы данных для деплоя на Railway.
Создает все таблицы и добавляет начальные данные.
"""

import os
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

# Добавляем текущую директорию в путь Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Загружаем переменные окружения
load_dotenv()

# Импортируем модели и базу данных
from db.database import Base, engine, SessionLocal
from models import User, Test

def wait_for_database(max_retries=30, delay=2):
    """Ждет пока база данных станет доступной"""
    for attempt in range(max_retries):
        try:
            # Пробуем подключиться к базе данных
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ База данных доступна!")
            return True
        except OperationalError as e:
            print(f"⏳ Попытка {attempt + 1}/{max_retries}: БД недоступна, ждем {delay}с...")
            if attempt == max_retries - 1:
                print(f"❌ Не удалось подключиться к БД после {max_retries} попыток")
                print(f"Ошибка: {e}")
                return False
            time.sleep(delay)
    return False

def create_tables():
    """Создает все таблицы в базе данных"""
    try:
        print("🔧 Создание таблиц в базе данных...")
        
        # Создаем все таблицы
        Base.metadata.create_all(bind=engine)
        
        print("✅ Таблицы успешно созданы!")
        
        # Проверяем созданные таблицы
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in result]
            print(f"📋 Созданные таблицы: {', '.join(tables)}")
            
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при создании таблиц: {e}")
        return False

def add_initial_test():
    """Добавляет начальный тест в базу данных"""
    try:
        print("🔧 Добавление начального теста...")
        
        # Создаем сессию базы данных
        db = SessionLocal()
        
        # Проверяем есть ли уже тест
        existing_test = db.query(Test).filter(Test.filename == "questions.json").first()
        if existing_test:
            print(f"✅ Тест уже существует: ID={existing_test.id}, filename={existing_test.filename}")
            return True
        
        # Создаем новый тест
        new_test = Test(
            filename="questions.json",
            is_available=True
        )
        
        db.add(new_test)
        db.commit()
        db.refresh(new_test)
        
        print(f"✅ Тест успешно добавлен!")
        print(f"📋 ID: {new_test.id}")
        print(f"📋 Filename: {new_test.filename}")
        print(f"📋 Available: {new_test.is_available}")
        print(f"📋 Created at: {new_test.created_at}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при добавлении теста: {e}")
        return False
    finally:
        db.close()

def main():
    """Главная функция инициализации"""
    print("🚀 Запуск инициализации базы данных для Railway...")
    
    # Выводим информацию о подключении
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Маскируем пароль в URL для безопасности
        masked_url = database_url.split('@')[1] if '@' in database_url else database_url
        print(f"🔌 Подключение к БД: {masked_url}")
    else:
        print("❌ DATABASE_URL не установлена!")
        sys.exit(1)
    
    # Шаг 1: Ждем доступности базы данных
    if not wait_for_database():
        sys.exit(1)
    
    # Шаг 2: Создаем таблицы
    if not create_tables():
        sys.exit(1)
    
    # Шаг 3: Добавляем начальные данные
    if not add_initial_test():
        sys.exit(1)
    
    print("🎉 Инициализация базы данных завершена успешно!")
    print("📝 Статистика:")
    
    # Показываем финальную статистику
    try:
        db = SessionLocal()
        
        test_count = db.query(Test).count()
        user_count = db.query(User).count()
        
        print(f"   - Тестов в системе: {test_count}")
        print(f"   - Пользователей: {user_count}")
        
    except Exception as e:
        print(f"   - Ошибка при получении статистики: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 