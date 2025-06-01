from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class TestStatusEnum(str, Enum):
    """Статус прохождения теста"""
    NOT_STARTED = "not_started"
    COMPLETED = "completed"

class TestResponse(BaseModel):
    """Схема для возврата данных теста"""
    id: int
    filename: str
    is_available: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TestStatus(BaseModel):
    """Схема для статуса теста пользователя"""
    test_id: int
    test_title: str  # Это поле будет заполняться из JSON файла
    status: TestStatusEnum
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TestResult(BaseModel):
    """Схема для результата теста"""
    test_id: int
    test_title: str  # Это поле будет заполняться из JSON файла
    result: Dict[str, Any]
    completed_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TestCompleteRequest(BaseModel):
    """Схема для завершения теста"""
    answers: List[str] = Field(..., description="Финальные ответы пользователя")
    result: Dict[str, Any] = Field(..., description="Результаты теста")
    
    @validator('answers')
    def validate_answers(cls, v):
        """Валидация финальных ответов"""
        valid_answers = {"да", "нет", "не знаю"}
        for answer in v:
            if answer.lower() not in valid_answers:
                raise ValueError(f'Недопустимый ответ: {answer}. Разрешены: да, нет, не знаю')
        return v 