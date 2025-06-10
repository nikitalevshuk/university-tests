from db.database import get_db
from models.user import User

# Получаем сессию
db = next(get_db())

# Смотрим всех пользователей в базе
users = db.query(User).all()
# print(f"Количество пользователей: {len(users)}")

for i, user in enumerate(users, 1):
    # print(f"\nПользователь {i}:")
    # print(f"  ID: {user.id}")
    # print(f"  Имя: '{user.first_name}'")
    # print(f"  Фамилия: '{user.last_name}'")
    # print(f"  Отчество: '{user.middle_name}'")
    # print(f"  Факультет: '{user.faculty}'")
    # print(f"  Курс: {user.course}")
    # print(f"  Хеш пароля: {user.password_hash[:20]}...")

db.close() 