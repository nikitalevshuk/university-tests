#!/usr/bin/env python3
"""
Скрипт для управления миграциями базы данных
"""
import os
import sys
import subprocess
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

def run_command(command):
    """Выполняет команду в терминале"""
    print(f"Выполняю: {command}")
    
    # Устанавливаем пароль PostgreSQL из переменных окружения
    env = os.environ.copy()
    
    # Извлекаем пароль из DATABASE_URL
    database_url = env.get('DATABASE_URL', '')
    if 'postgresql://' in database_url:
        # Парсим URL: postgresql://user:password@host:port/db
        parts = database_url.replace('postgresql://', '').split('@')[0]
        if ':' in parts:
            user, password = parts.split(':')
            env['PGPASSWORD'] = password
    
    result = subprocess.run(command, shell=True, env=env)
    return result.returncode == 0

def create_migration(message):
    """Создает новую миграцию"""
    command = f'alembic revision --autogenerate -m "{message}"'
    return run_command(command)

def upgrade_database():
    """Применяет все миграции"""
    command = 'alembic upgrade head'
    return run_command(command)

def downgrade_database(revision='base'):
    """Откатывает миграции"""
    command = f'alembic downgrade {revision}'
    return run_command(command)

def show_current_revision():
    """Показывает текущую ревизию"""
    command = 'alembic current'
    return run_command(command)

def show_history():
    """Показывает историю миграций"""
    command = 'alembic history'
    return run_command(command)

def main():
    if len(sys.argv) < 2:
        print("Использование:")
        print("  python migrate.py create <message>  - Создать новую миграцию")
        print("  python migrate.py upgrade           - Применить все миграции")
        print("  python migrate.py downgrade [rev]   - Откатить миграции")
        print("  python migrate.py current           - Показать текущую ревизию")
        print("  python migrate.py history           - Показать историю миграций")
        return

    action = sys.argv[1]

    if action == 'create':
        if len(sys.argv) < 3:
            print("Ошибка: Укажите сообщение для миграции")
            return
        message = ' '.join(sys.argv[2:])
        if create_migration(message):
            print("✅ Миграция создана успешно")
        else:
            print("❌ Ошибка при создании миграции")

    elif action == 'upgrade':
        if upgrade_database():
            print("✅ Миграции применены успешно")
        else:
            print("❌ Ошибка при применении миграций")

    elif action == 'downgrade':
        revision = sys.argv[2] if len(sys.argv) > 2 else 'base'
        if downgrade_database(revision):
            print("✅ Миграции откачены успешно")
        else:
            print("❌ Ошибка при откате миграций")

    elif action == 'current':
        show_current_revision()

    elif action == 'history':
        show_history()

    else:
        print(f"Неизвестное действие: {action}")

if __name__ == '__main__':
    main() 