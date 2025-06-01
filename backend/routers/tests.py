"""
Роутер для работы с тестами
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from models.test import Test
from schemas.test import TestResponse
from auth.auth import get_current_active_user

router = APIRouter(prefix="/tests", tags=["Тесты"])

@router.get("/", response_model=List[TestResponse])
async def get_all_tests(db: Session = Depends(get_db)):
    """
    Получение списка всех тестов
    
    Возвращает все тесты в системе
    """
    tests = db.query(Test).all()
    return tests

@router.get("/available", response_model=List[TestResponse])
async def get_available_tests(db: Session = Depends(get_db)):
    """
    Получение списка всех доступных тестов
    
    Возвращает все тесты, которые доступны для прохождения
    """
    tests = Test.get_available_tests(db)
    return tests

@router.get("/{test_id}", response_model=TestResponse)
async def get_test_by_id(
    test_id: int,
    db: Session = Depends(get_db)
):
    """
    Получение информации о конкретном тесте
    
    Args:
        test_id: ID теста
        
    Returns:
        TestResponse: Информация о тесте
        
    Raises:
        HTTPException: Если тест не найден или недоступен
    """
    test = db.query(Test).filter(
        Test.id == test_id,
        Test.is_available == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден или недоступен"
        )
    
    return test 