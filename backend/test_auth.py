from db.database import get_db
from auth.auth import authenticate_user
from models.user import FacultyEnum, CourseEnum

# Получаем сессию
db = next(get_db())

# Тестируем аутентификацию с данными первого пользователя
test_first_name = "Бурдей"
test_last_name = "Антон"  
test_middle_name = "Александрович"
test_faculty = FacultyEnum.FIB  # Предполагаем что это ФИБ
test_course = CourseEnum.FIRST  # Предполагаем что это 1 курс
test_password = "iop123iop"  # Предполагаемый пароль

print(f"Тестируем аутентификацию:")
print(f"Имя: {test_first_name}")
print(f"Фамилия: {test_last_name}")
print(f"Отчество: {test_middle_name}")
print(f"Факультет: {test_faculty}")
print(f"Курс: {test_course}")
print(f"Пароль: {test_password}")

user = authenticate_user(db, test_first_name, test_last_name, test_middle_name, test_faculty, test_course, test_password)

if user:
    print(f"✅ Аутентификация успешна! Пользователь ID: {user.id}")
    print(f"   Факультет в БД: {user.faculty}")
    print(f"   Курс в БД: {user.course}")
else:
    print("❌ Аутентификация не удалась")

db.close() 