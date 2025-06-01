#!/usr/bin/env python3
"""
Скрипт для добавления тестовых данных в базу данных
"""
import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Добавляем текущую директорию в путь
sys.path.append(os.path.dirname(__file__))

# Загружаем переменные окружения
load_dotenv()

from db.database import SessionLocal, engine
from models.test import Test
from models.user import User

def create_test_data():
    """Создает тестовые данные"""
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже тесты
        existing_tests = db.query(Test).count()
        if existing_tests > 0:
            print(f"В базе уже есть {existing_tests} тестов. Пропускаю создание тестовых данных.")
            return
        
        # Создаем тестовые тесты
        test_data = [
            {
                "title": "Тест на тревожность",
                "description": "Психологический тест для определения уровня тревожности",
                "filename": "anxiety_test.json",
                "is_available": True
            },
            {
                "title": "Тест на депрессию",
                "description": "Тест для выявления признаков депрессивного состояния",
                "filename": "depression_test.json",
                "is_available": True
            },
            {
                "title": "Тест на стресс",
                "description": "Оценка уровня стресса и способности справляться с ним",
                "filename": "stress_test.json",
                "is_available": True
            },
            {
                "title": "Тест личности",
                "description": "Комплексный тест для определения типа личности",
                "filename": "personality_test.json",
                "is_available": False  # Недоступен для демонстрации
            }
        ]
        
        for test_info in test_data:
            test = Test(**test_info)
            db.add(test)
        
        db.commit()
        print(f"✅ Создано {len(test_data)} тестовых тестов")
        
        # Выводим информацию о созданных тестах
        tests = db.query(Test).all()
        print("\n📋 Созданные тесты:")
        for test in tests:
            status = "✅ Доступен" if test.is_available else "❌ Недоступен"
            print(f"  {test.id}. {test.title} - {status}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании тестовых данных: {e}")
        db.rollback()
    finally:
        db.close()

def show_database_info():
    """Показывает информацию о базе данных"""
    db = SessionLocal()
    
    try:
        users_count = db.query(User).count()
        tests_count = db.query(Test).count()
        available_tests_count = db.query(Test).filter(Test.is_available == True).count()
        
        print("\n📊 Информация о базе данных:")
        print(f"  👥 Пользователей: {users_count}")
        print(f"  📋 Всего тестов: {tests_count}")
        print(f"  ✅ Доступных тестов: {available_tests_count}")
        
        if tests_count > 0:
            print("\n📋 Список тестов:")
            tests = db.query(Test).all()
            for test in tests:
                status = "✅" if test.is_available else "❌"
                print(f"  {status} {test.id}. {test.title}")
        
    except Exception as e:
        print(f"❌ Ошибка при получении информации о базе: {e}")
    finally:
        db.close()

def main():
    """Главная функция"""
    if len(sys.argv) > 1 and sys.argv[1] == "info":
        show_database_info()
    else:
        print("🔧 Создание тестовых данных...")
        create_test_data()
        show_database_info()

if __name__ == "__main__":
    main() 