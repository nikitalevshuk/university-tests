from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from models.user import FacultyEnum, CourseEnum

class UserCreate(BaseModel):
    """Схема для создания пользователя (регистрация)"""
    first_name: str = Field(..., min_length=2, max_length=100, description="Имя пользователя")
    last_name: str = Field(..., min_length=2, max_length=100, description="Фамилия пользователя")
    middle_name: str = Field(..., min_length=2, max_length=100, description="Отчество пользователя")
    faculty: Union[FacultyEnum, str] = Field(..., description="Факультет")
    course: Union[CourseEnum, int] = Field(..., description="Курс обучения")
    password: str = Field(..., min_length=6, max_length=32, description="Пароль")
    
    @validator('first_name', 'last_name', 'middle_name')
    def validate_names(cls, v):
        """Валидация имен - только кириллица и дефис"""
        import re
        if not re.match(r'^[А-Яа-яЁё\-]+$', v):
            raise ValueError('Имя должно содержать только кириллические символы и дефис')
        return v.strip().title()
    
    @validator('faculty')
    def validate_faculty(cls, v):
        """Преобразование строки в FacultyEnum"""
        if isinstance(v, str):
            faculty_mapping = {
                "ФИБ": FacultyEnum.FIB,
                "ФКСИС": FacultyEnum.FKSIS,
                "ФКП": FacultyEnum.FKP,
                "ФРЭ": FacultyEnum.FRE,
                "ИЭФ": FacultyEnum.IEF,
                "ФИТУ": FacultyEnum.FITU
            }
            if v not in faculty_mapping:
                raise ValueError(f'Неизвестный факультет: {v}')
            return faculty_mapping[v]
        return v
    
    @validator('course')
    def validate_course(cls, v):
        """Преобразование числа в CourseEnum"""
        if isinstance(v, int):
            course_mapping = {
                1: CourseEnum.FIRST,
                2: CourseEnum.SECOND,
                3: CourseEnum.THIRD,
                4: CourseEnum.FOURTH,
                5: CourseEnum.FIFTH,
                6: CourseEnum.SIXTH
            }
            if v not in course_mapping:
                raise ValueError(f'Неизвестный курс: {v}')
            return course_mapping[v]
        return v
    
    @validator('password')
    def validate_password(cls, v):
        """Валидация пароля"""
        import re
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=]+$', v):
            raise ValueError('Пароль может содержать только латинские буквы, цифры и символы !@#$%^&*()_+-=')
        return v

class UserLogin(BaseModel):
    """Схема для авторизации пользователя"""
    first_name: str = Field(..., description="Имя пользователя")
    last_name: str = Field(..., description="Фамилия пользователя")
    middle_name: str = Field(..., description="Отчество пользователя")
    faculty: Union[FacultyEnum, str] = Field(..., description="Факультет")
    course: Union[CourseEnum, int] = Field(..., description="Курс обучения")
    password: str = Field(..., description="Пароль")
    
    @validator('faculty')
    def validate_faculty(cls, v):
        """Преобразование строки в FacultyEnum"""
        print("[DEBUG TEMPORARY LOG] UserLogin.validate_faculty(): вход в валидатор, v =", v, "type =", type(v))
        
        if isinstance(v, str):
            faculty_mapping = {
                "ФИБ": FacultyEnum.FIB,
                "ФКСИС": FacultyEnum.FKSIS,
                "ФКП": FacultyEnum.FKP,
                "ФРЭ": FacultyEnum.FRE,
                "ИЭФ": FacultyEnum.IEF,
                "ФИТУ": FacultyEnum.FITU
            }
            print("[DEBUG TEMPORARY LOG] UserLogin.validate_faculty(): проверяем строку в mapping")
            if v not in faculty_mapping:
                print("[DEBUG TEMPORARY LOG] UserLogin.validate_faculty(): неизвестный факультет")
                raise ValueError(f'Неизвестный факультет: {v}')
            result = faculty_mapping[v]
            print("[DEBUG TEMPORARY LOG] UserLogin.validate_faculty(): преобразовано в enum =", result)
            return result
        
        print("[DEBUG TEMPORARY LOG] UserLogin.validate_faculty(): уже enum, возвращаем как есть")
        return v
    
    @validator('course')
    def validate_course(cls, v):
        """Преобразование числа в CourseEnum"""
        print("[DEBUG TEMPORARY LOG] UserLogin.validate_course(): вход в валидатор, v =", v, "type =", type(v))
        
        if isinstance(v, int):
            course_mapping = {
                1: CourseEnum.FIRST,
                2: CourseEnum.SECOND,
                3: CourseEnum.THIRD,
                4: CourseEnum.FOURTH,
                5: CourseEnum.FIFTH,
                6: CourseEnum.SIXTH
            }
            print("[DEBUG TEMPORARY LOG] UserLogin.validate_course(): проверяем число в mapping")
            if v not in course_mapping:
                print("[DEBUG TEMPORARY LOG] UserLogin.validate_course(): неизвестный курс")
                raise ValueError(f'Неизвестный курс: {v}')
            result = course_mapping[v]
            print("[DEBUG TEMPORARY LOG] UserLogin.validate_course(): преобразовано в enum =", result)
            return result
        
        print("[DEBUG TEMPORARY LOG] UserLogin.validate_course(): уже enum, возвращаем как есть")
        return v

class UserUpdate(BaseModel):
    """Схема для обновления данных пользователя"""
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    middle_name: Optional[str] = Field(None, min_length=2, max_length=100)
    faculty: Optional[FacultyEnum] = None
    course: Optional[CourseEnum] = None

class UserResponse(BaseModel):
    """Схема для возврата данных пользователя"""
    id: int
    first_name: str
    last_name: str
    middle_name: str
    faculty: FacultyEnum
    course: CourseEnum
    created_at: datetime
    completed_tests: List[Dict[str, Any]] = []
    
    @property
    def full_name(self) -> str:
        """Полное имя пользователя"""
        return f"{self.last_name} {self.first_name} {self.middle_name}"
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            FacultyEnum: lambda v: v.value,
            CourseEnum: lambda v: v.value
        } 