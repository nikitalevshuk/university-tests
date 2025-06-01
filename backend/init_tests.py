#!/usr/bin/env python3
"""
Скрипт для инициализации тестов в базе данных
"""

from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models.test import Test

def init_tests():
    """Создаем записи тестов в БД"""
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже тесты в БД
        existing_tests = db.query(Test).count()
        
        if existing_tests == 0:
            print("Создаём записи тестов в БД...")
            
            # Создаем тест адаптации
            adaptation_test = Test(
                filename="questions.json",
                is_available=True
            )
            
            db.add(adaptation_test)
            db.commit()
            
            print(f"✓ Создан тест: {adaptation_test.filename} (ID: {adaptation_test.id})")
            
        else:
            print(f"В БД уже есть {existing_tests} тест(ов)")
            
            # Показываем существующие тесты
            tests = db.query(Test).all()
            for test in tests:
                print(f"  - ID {test.id}: {test.filename} ({'доступен' if test.is_available else 'недоступен'})")
        
    except Exception as e:
        print(f"Ошибка при инициализации тестов: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Инициализация тестов в БД ===")
    init_tests()
    print("=== Завершено ===") 