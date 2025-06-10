#!/usr/bin/env python3
"""
Скрипт для создания таблиц в базе данных.
Используется как альтернатива Alembic миграциям.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Добавляем текущую директорию в путь Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Загружаем переменные окружения
load_dotenv()

# Импортируем модели и базу данных
from db.database import Base, engine
from models import User, Test

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
            
    except Exception as e:
        print(f"❌ Ошибка при создании таблиц: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_tables() 