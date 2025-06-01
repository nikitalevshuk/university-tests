"""
Утилиты для загрузки данных тестов из JSON файлов
"""

import json
import os
from typing import Dict, Any, Optional

def load_test_data(filename: str) -> Optional[Dict[str, Any]]:
    """
    Загружает данные теста из JSON файла
    
    Args:
        filename: Имя JSON файла (например, 'questions.json')
        
    Returns:
        Dict с данными теста или None если файл не найден
    """
    # Пути к JSON файлам - они лежат в frontend/public
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    json_path = os.path.join(base_dir, 'frontend', 'public', filename)
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        # Первый элемент содержит метаданные теста
        if data and len(data) > 0:
            metadata = data[0]
            
            # Извлекаем базовую информацию о тесте
            test_info = {
                'title': metadata.get('title', 'Неизвестный тест'),
                'description': metadata.get('description', 'Описание недоступно'),
                'questions': [item for item in data[1:] if item.get('question')]
            }
            
            return test_info
            
    except FileNotFoundError:
        print(f"JSON файл не найден: {json_path}")
        return None
    except json.JSONDecodeError as e:
        print(f"Ошибка при чтении JSON файла {filename}: {e}")
        return None
    except Exception as e:
        print(f"Неожиданная ошибка при загрузке файла {filename}: {e}")
        return None
    
    return None

def get_test_title(filename: str) -> str:
    """
    Получает название теста из JSON файла
    
    Args:
        filename: Имя JSON файла
        
    Returns:
        Название теста или имя файла без расширения если не удалось загрузить
    """
    test_data = load_test_data(filename)
    if test_data:
        return test_data.get('title', filename.replace('.json', ''))
    
    # Если не удалось загрузить данные, возвращаем имя файла без расширения
    return filename.replace('.json', '').replace('_', ' ').title() 