# Модели данных Backend

## Обзор

Модели данных построены на SQLAlchemy ORM и представляют структуру базы данных PostgreSQL.

**Расположение:** `backend/models/`

## Структура моделей

### User (Пользователь)

**Файл:** `backend/models/user.py`

#### Описание
Модель представляет пользователей системы психологического тестирования (студентов).

#### Поля таблицы `users`

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | Integer | Уникальный идентификатор | Primary Key, Auto Increment |
| `first_name` | String(100) | Имя пользователя | NOT NULL |
| `last_name` | String(100) | Фамилия пользователя | NOT NULL |
| `middle_name` | String(100) | Отчество пользователя | NOT NULL |
| `faculty` | Enum | Факультет | NOT NULL, см. FacultyEnum |
| `course` | Enum | Курс обучения | NOT NULL, см. CourseEnum |
| `password_hash` | String(255) | Хэш пароля | NOT NULL |
| `created_at` | DateTime | Дата создания аккаунта | NOT NULL, auto-generated |
| `completed_tests` | JSON | Результаты пройденных тестов | Default: [] |

#### Enum типы

**FacultyEnum** - Доступные факультеты:
```python
class FacultyEnum(enum.Enum):
    FIB = "ФИБ"        # Факультет информационных бизнес-систем
    FKSIS = "ФКСИС"    # Факультет компьютерных систем и сетей
    FKP = "ФКП"        # Факультет компьютерного проектирования
    FRE = "ФРЭ"        # Факультет радиоэлектроники
    IEF = "ИЭФ"        # Инженерно-экономический факультет  
    FITU = "ФИТУ"      # Факультет информационных технологий
```

**CourseEnum** - Доступные курсы:
```python
class CourseEnum(enum.Enum):
    FIRST = 1    # 1 курс
    SECOND = 2   # 2 курс
    THIRD = 3    # 3 курс
    FOURTH = 4   # 4 курс
    FIFTH = 5    # 5 курс
    SIXTH = 6    # 6 курс
```

#### Методы модели

##### `full_name` (property)
Возвращает полное имя пользователя в формате "Фамилия Имя Отчество".

```python
user = User(first_name="Иван", last_name="Иванов", middle_name="Иванович")
print(user.full_name)  # "Иванов Иван Иванович"
```

##### `add_completed_test(test_id: int, result: dict, completed_at: str)`
Добавляет информацию о пройденном тесте в JSON поле `completed_tests`.

**Параметры:**
- `test_id`: ID теста
- `result`: Результаты теста (dict)
- `completed_at`: Дата и время завершения (ISO string)

**Пример:**
```python
user.add_completed_test(
    test_id=1,
    result={"type": "Сангвиник", "score": 85},
    completed_at="2024-01-15T10:30:00"
)
```

##### `get_test_result(test_id: int) -> dict | None`
Получает результат конкретного теста.

**Возвращает:** Словарь с результатом или None если тест не пройден.

##### `has_completed_test(test_id: int) -> bool`
Проверяет, пройден ли тест пользователем.

#### Структура JSON поля `completed_tests`
```json
[
    {
        "test_id": 1,
        "result": {
            "type": "Сангвиник",
            "score": 85,
            "details": "..."
        },
        "completed_at": "2024-01-15T10:30:00"
    }
]
```

#### Вспомогательные функции

##### `get_faculty_enum(faculty_str: str) -> FacultyEnum`
Преобразует строковое значение факультета в enum.

**Пример:**
```python
faculty = get_faculty_enum("ФИБ")  # FacultyEnum.FIB
```

##### `get_course_enum(course_int: int) -> CourseEnum`
Преобразует числовое значение курса в enum.

**Пример:**
```python
course = get_course_enum(1)  # CourseEnum.FIRST
```

---

### Test (Тест)

**Файл:** `backend/models/test.py`

#### Описание
Модель представляет психологические тесты в системе.

#### Поля таблицы `tests`

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | Integer | Уникальный идентификатор | Primary Key, Auto Increment |
| `title` | String(200) | Название теста | NOT NULL |
| `description` | Text | Описание теста | NOT NULL |
| `questions` | JSON | Вопросы и варианты ответов | NOT NULL |
| `scoring_rules` | JSON | Правила подсчета результатов | NOT NULL |
| `created_at` | DateTime | Дата создания теста | NOT NULL, auto-generated |
| `is_active` | Boolean | Активен ли тест | Default: True |

#### Методы модели

##### `calculate_result(answers: List[dict]) -> dict`
Вычисляет результат теста на основе ответов пользователя.

**Параметры:**
- `answers`: Список ответов пользователя

**Возвращает:** Словарь с результатом теста.

##### `get_questions_for_user() -> List[dict]`
Возвращает вопросы теста без правильных ответов (для безопасности).

#### Структура JSON поля `questions`
```json
[
    {
        "id": 1,
        "text": "Текст вопроса",
        "options": [
            "Вариант ответа 1",
            "Вариант ответа 2",
            "Вариант ответа 3"
        ],
        "type": "single_choice"
    }
]
```

#### Структура JSON поля `scoring_rules`
```json
{
    "type": "temperament",
    "scales": {
        "sanguine": {
            "questions": [1, 3, 5],
            "weights": [1, 1, 1]
        },
        "choleric": {
            "questions": [2, 4, 6],
            "weights": [1, 1, 1]
        }
    },
    "interpretation": {
        "sanguine": "Сангвиник - активный, общительный",
        "choleric": "Холерик - энергичный, импульсивный"
    }
}
```

---

## Связи между моделями

### Пользователь ↔ Тесты
Связь реализована через JSON поле `completed_tests` в модели User.

**Альтернативный подход** (для будущих версий):
Можно создать отдельную таблицу `user_test_results` для нормализации данных:

```python
class UserTestResult(Base):
    __tablename__ = "user_test_results"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    test_id = Column(Integer, ForeignKey("tests.id"))
    result = Column(JSON)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="test_results")
    test = relationship("Test", back_populates="user_results")
```

---

## Миграции базы данных

### Инструменты
- **Alembic** - для управления миграциями
- **SQLAlchemy** - ORM для работы с БД

### Команды миграций

#### Создание новой миграции
```bash
alembic revision --autogenerate -m "Описание изменений"
```

#### Применение миграций
```bash
alembic upgrade head
```

#### Откат миграций
```bash
alembic downgrade -1  # На одну версию назад
alembic downgrade base  # До начального состояния
```

#### Просмотр истории
```bash
alembic history
alembic current
```

### Пример миграции
```python
"""Add completed_tests column to users

Revision ID: abc123
Revises: def456
Create Date: 2024-01-15 10:30:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.add_column('users', 
        sa.Column('completed_tests', 
                  postgresql.JSON(astext_bag=False), 
                  nullable=True, 
                  default=sa.text("'[]'::json")
        )
    )

def downgrade():
    op.drop_column('users', 'completed_tests')
```

---

## Работа с моделями

### Создание пользователя
```python
from models.user import User, get_faculty_enum, get_course_enum
from db.database import get_db

# Создание нового пользователя
user = User(
    first_name="Иван",
    last_name="Иванов", 
    middle_name="Иванович",
    faculty=get_faculty_enum("ФИБ"),
    course=get_course_enum(1),
    password_hash="hashed_password",
    completed_tests=[]
)

# Сохранение в БД
db = next(get_db())
db.add(user)
db.commit()
db.refresh(user)
```

### Поиск пользователей
```python
# По ID
user = db.query(User).filter(User.id == 1).first()

# По полному имени
user = db.query(User).filter(
    User.first_name == "Иван",
    User.last_name == "Иванов",
    User.middle_name == "Иванович"
).first()

# По факультету и курсу
users = db.query(User).filter(
    User.faculty == FacultyEnum.FIB,
    User.course == CourseEnum.FIRST
).all()
```

### Работа с результатами тестов
```python
# Добавление результата теста
user.add_completed_test(
    test_id=1,
    result={"type": "Сангвиник", "score": 85},
    completed_at=datetime.utcnow().isoformat()
)
db.commit()

# Проверка прохождения теста
if user.has_completed_test(1):
    result = user.get_test_result(1)
    print(f"Результат: {result['result']}")
```

---

## Валидация данных

### На уровне базы данных
- NOT NULL ограничения
- Enum значения
- Длина строк
- Уникальность (при необходимости)

### На уровне приложения
Валидация осуществляется через Pydantic схемы (см. `backend/schemas/`).

### Примеры валидации
```python
# Проверка корректности факультета
try:
    faculty = get_faculty_enum("Неизвестный факультет")
except ValueError as e:
    print(f"Ошибка: {e}")

# Проверка корректности курса
try:
    course = get_course_enum(10)  # Недопустимый курс
except ValueError as e:
    print(f"Ошибка: {e}")
```

---

## Индексы базы данных

### Текущие индексы
- Primary key на `id` (автоматически)
- Index на `id` в таблице users

### Рекомендуемые дополнительные индексы
```sql
-- Для быстрого поиска пользователей по ФИО
CREATE INDEX idx_users_full_name ON users(last_name, first_name, middle_name);

-- Для поиска по факультету и курсу
CREATE INDEX idx_users_faculty_course ON users(faculty, course);

-- Для поиска активных тестов
CREATE INDEX idx_tests_active ON tests(is_active) WHERE is_active = true;
```

---

## Производительность

### Оптимизация запросов
- Использование индексов
- Lazy loading для связанных данных
- Пагинация для больших выборок

### Мониторинг
- Логирование медленных запросов
- EXPLAIN ANALYZE для анализа планов выполнения
- Мониторинг использования индексов

### Пример оптимизированного запроса
```python
# Вместо N+1 запросов
users = db.query(User).all()
for user in users:
    print(user.completed_tests)  # Множественные запросы

# Используем один запрос с предзагрузкой
users = db.query(User).options(
    selectinload(User.completed_tests)
).all()
``` 