"""
Роутер для работы с пользователями и их тестами
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from db.database import get_db
from models.user import User
from models.test import Test
from schemas.test import TestStatus, TestStatusEnum, TestResult, TestCompleteRequest
from auth.auth import get_current_active_user
from utils.test_loader import get_test_title

router = APIRouter(prefix="/user-tests", tags=["Пользовательские тесты"])

@router.get("/status", response_model=List[TestStatus])
async def get_user_tests_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Получение статуса всех тестов для текущего пользователя
    
    Возвращает статус каждого теста:
    - completed: тест завершен
    - not_started: тест не проходился
    """
    # Получаем все доступные тесты
    available_tests = Test.get_available_tests(db)
    
    # Получаем завершенные тесты
    completed_tests = {test["test_id"]: test for test in (current_user.completed_tests or [])}
    
    # Дебаг логирование
    print(f"User {current_user.id} completed_tests from DB:", current_user.completed_tests)
    print(f"Processed completed_tests dict:", completed_tests)
    print(f"Available tests:", [(test.id, test.filename) for test in available_tests])
    
    test_statuses = []
    
    for test in available_tests:
        # Загружаем название теста из JSON файла
        test_title = get_test_title(test.filename)
        
        if test.id in completed_tests:
            # Тест завершен
            completed_test = completed_tests[test.id]
            print(f"Test {test.id} is COMPLETED for user {current_user.id}")
            status_obj = TestStatus(
                test_id=test.id,
                test_title=test_title,
                status=TestStatusEnum.COMPLETED,
                completed_at=datetime.fromisoformat(completed_test["completed_at"]),
                result=completed_test["result"]
            )
        else:
            # Тест не проходился
            print(f"Test {test.id} is NOT_STARTED for user {current_user.id}")
            status_obj = TestStatus(
                test_id=test.id,
                test_title=test_title,
                status=TestStatusEnum.NOT_STARTED
            )
        
        test_statuses.append(status_obj)
    
    print(f"Final test_statuses for user {current_user.id}:", [{"test_id": ts.test_id, "status": ts.status} for ts in test_statuses])
    
    return test_statuses

@router.post("/{test_id}/complete")
async def complete_test(
    test_id: int,
    completion_data: TestCompleteRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Завершение теста и сохранение результатов
    
    Сохраняет результат в completed_tests
    """
    # Убеждаемся что test_id - это int
    test_id = int(test_id)
    
    # Проверяем, что тест существует и доступен
    test = db.query(Test).filter(
        Test.id == test_id,
        Test.is_available == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден или недоступен"
        )
    
    # Проверяем, не завершен ли уже тест
    if current_user.has_completed_test(test_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Тест уже завершен"
        )
    
    # Сохраняем результат в completed_tests
    current_user.add_completed_test(
        test_id=test_id,
        result=completion_data.result,
        completed_at=datetime.utcnow().isoformat()
    )
    
    # ВАЖНО: Помечаем JSON поле как измененное для SQLAlchemy
    flag_modified(current_user, 'completed_tests')
    
    # Коммитим изменения
    db.commit()
    
    return {
        "message": "Тест успешно завершен",
        "test_id": test_id,
        "result": completion_data.result
    }

@router.get("/{test_id}/results", response_model=TestResult)
async def get_test_results(
    test_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Получение результатов завершенного теста
    
    Возвращает результаты теста из completed_tests
    """
    # Проверяем, что тест существует
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    # Проверяем, что тест завершен
    if not current_user.has_completed_test(test_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Результаты теста не найдены. Тест не завершен."
        )
    
    # Получаем результат из completed_tests
    completed_tests = current_user.completed_tests or []
    test_result = None
    
    for completed_test in completed_tests:
        if completed_test["test_id"] == test_id:
            test_result = completed_test
            break
    
    if not test_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Результаты теста не найдены"
        )
    
    # Загружаем название теста из JSON файла
    test_title = get_test_title(test.filename)
    
    return TestResult(
        test_id=test_id,
        test_title=test_title,
        result=test_result["result"],
        completed_at=datetime.fromisoformat(test_result["completed_at"])
    ) 