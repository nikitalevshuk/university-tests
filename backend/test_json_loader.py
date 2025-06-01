#!/usr/bin/env python3
"""
Тестовый скрипт для проверки загрузки JSON данных
"""

from utils.test_loader import load_test_data, get_test_title

def test_json_loading():
    print("=== Тестирование загрузки JSON данных ===")
    
    # Тестируем загрузку данных
    print("\n1. Загрузка данных из questions.json:")
    data = load_test_data('questions.json')
    
    if data:
        print(f"✓ Данные загружены успешно")
        print(f"  - Название: {data['title']}")
        print(f"  - Описание: {data['description'][:100]}...")
        print(f"  - Количество вопросов: {len(data['questions'])}")
    else:
        print("✗ Не удалось загрузить данные")
    
    # Тестируем получение названия
    print("\n2. Получение названия теста:")
    title = get_test_title('questions.json')
    print(f"  - Название: {title}")
    
    # Тестируем несуществующий файл
    print("\n3. Тестирование несуществующего файла:")
    bad_data = load_test_data('nonexistent.json')
    print(f"  - Результат: {bad_data}")
    
    bad_title = get_test_title('nonexistent.json')
    print(f"  - Fallback название: {bad_title}")

if __name__ == "__main__":
    test_json_loading() 