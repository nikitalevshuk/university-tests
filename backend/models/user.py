from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum
from sqlalchemy.sql import func
from db.database import Base
import enum

class FacultyEnum(enum.Enum):
    """Перечисление факультетов"""
    FIB = "ФИБ"
    FKSIS = "ФКСИС"
    FKP = "ФКП"
    FRE = "ФРЭ"
    IEF = "ИЭФ"
    FITU = "ФИТУ"

class CourseEnum(enum.Enum):
    """Перечисление курсов"""
    FIRST = 1
    SECOND = 2
    THIRD = 3
    FOURTH = 4
    FIFTH = 5
    SIXTH = 6

class User(Base):
    """
    Модель пользователя системы психологического тестирования.
    
    Attributes:
        id: Уникальный идентификатор пользователя
        first_name: Имя пользователя
        last_name: Фамилия пользователя
        middle_name: Отчество пользователя
        faculty: Факультет (enum)
        course: Курс обучения (enum)
        password_hash: Хэш пароля
        created_at: Дата и время создания аккаунта
        completed_tests: JSON с информацией о пройденных тестах
    """
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False, comment="Имя пользователя")
    last_name = Column(String(100), nullable=False, comment="Фамилия пользователя")
    middle_name = Column(String(100), nullable=False, comment="Отчество пользователя")
    
    faculty = Column(
        Enum(FacultyEnum), 
        nullable=False, 
        comment="Факультет пользователя"
    )
    
    course = Column(
        Enum(CourseEnum), 
        nullable=False, 
        comment="Курс обучения"
    )
    
    password_hash = Column(String(255), nullable=False, comment="Хэш пароля")
    
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="Дата и время создания аккаунта"
    )
    
    completed_tests = Column(
        JSON, 
        default=list, 
        comment="Список пройденных тестов с результатами"
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.last_name} {self.first_name} {self.middle_name}', faculty={self.faculty.value})>"
    
    @property
    def full_name(self):
        """Возвращает полное имя пользователя"""
        return f"{self.last_name} {self.first_name} {self.middle_name}"
    
    def add_completed_test(self, test_id: int, result: dict, completed_at: str):
        """
        Добавляет информацию о пройденном тесте
        
        Args:
            test_id: ID теста
            result: Результаты теста
            completed_at: Дата и время завершения теста
        """
        if self.completed_tests is None:
            self.completed_tests = []
        
        test_info = {
            "test_id": test_id,
            "result": result,
            "completed_at": completed_at
        }
        
        # Проверяем, не был ли тест уже пройден
        existing_test_index = None
        for i, test in enumerate(self.completed_tests):
            if test.get("test_id") == test_id:
                existing_test_index = i
                break
        
        if existing_test_index is not None:
            # Обновляем существующий результат
            self.completed_tests[existing_test_index] = test_info
        else:
            # Добавляем новый результат
            self.completed_tests.append(test_info)
    
    def get_test_result(self, test_id: int):
        """
        Получает результат конкретного теста
        
        Args:
            test_id: ID теста
            
        Returns:
            dict или None: Результат теста или None если тест не пройден
        """
        if not self.completed_tests:
            return None
        
        for test in self.completed_tests:
            if test.get("test_id") == test_id:
                return test
        
        return None
    
    def has_completed_test(self, test_id: int) -> bool:
        """
        Проверяет, пройден ли тест пользователем
        
        Args:
            test_id: ID теста
            
        Returns:
            bool: True если тест пройден, False иначе
        """
        return self.get_test_result(test_id) is not None 

def get_faculty_enum(faculty_str: str) -> FacultyEnum:
    """
    Преобразует строковое значение факультета в enum
    
    Args:
        faculty_str: Строковое значение факультета
        
    Returns:
        FacultyEnum: Соответствующий enum
        
    Raises:
        ValueError: Если факультет не найден
    """
    faculty_mapping = {
        "ФИБ": FacultyEnum.FIB,
        "ФКСИС": FacultyEnum.FKSIS,
        "ФКП": FacultyEnum.FKP,
        "ФРЭ": FacultyEnum.FRE,
        "ИЭФ": FacultyEnum.IEF,
        "ФИТУ": FacultyEnum.FITU
    }
    
    if faculty_str not in faculty_mapping:
        raise ValueError(f"Неизвестный факультет: {faculty_str}")
    
    return faculty_mapping[faculty_str]

def get_course_enum(course_int: int) -> CourseEnum:
    """
    Преобразует числовое значение курса в enum
    
    Args:
        course_int: Числовое значение курса
        
    Returns:
        CourseEnum: Соответствующий enum
        
    Raises:
        ValueError: Если курс не найден
    """
    course_mapping = {
        1: CourseEnum.FIRST,
        2: CourseEnum.SECOND,
        3: CourseEnum.THIRD,
        4: CourseEnum.FOURTH,
        5: CourseEnum.FIFTH,
        6: CourseEnum.SIXTH
    }
    
    if course_int not in course_mapping:
        raise ValueError(f"Неизвестный курс: {course_int}")
    
    return course_mapping[course_int] 