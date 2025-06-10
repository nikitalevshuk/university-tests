#!/usr/bin/env python3
"""
Скрипт для добавления теста в базу данных.
"""

import os
import sys
import json
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Добавляем текущую директорию в путь Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Загружаем переменные окружения
load_dotenv()

# Импортируем модели и базу данных
from db.database import SessionLocal
from models.test import Test

def add_test():
    """Добавляет тест в базу данных"""
    try:
        # print("🔧 Добавление теста в базу данных...")
        
        # Создаем сессию базы данных
        db = SessionLocal()
        
        # Проверяем есть ли уже тест
        existing_test = db.query(Test).filter(Test.filename == "questions.json").first()
        if existing_test:
            # print(f"✅ Тест уже существует: ID={existing_test.id}, filename={existing_test.filename}")
            return
        
        # Создаем новый тест
        new_test = Test(
            filename="questions.json",
            is_available=True
        )
        
        db.add(new_test)
        db.commit()
        db.refresh(new_test)
        
        # print(f"✅ Тест успешно добавлен!")
        # print(f"📋 ID: {new_test.id}")
        # print(f"📋 Filename: {new_test.filename}")
        # print(f"📋 Available: {new_test.is_available}")
        # print(f"📋 Created at: {new_test.created_at}")
        
    except Exception as e:
        # print(f"❌ Ошибка при добавлении теста: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    add_test() 