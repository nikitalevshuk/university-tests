"""
Роутер для аутентификации и авторизации пользователей
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from db.database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse
from schemas.auth import Token
from models.user import User, get_faculty_enum, get_course_enum
from auth.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    authenticate_user,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_token_expire_time
)

router = APIRouter(prefix="/auth", tags=["Аутентификация"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Регистрация нового пользователя
    
    Создает нового пользователя и возвращает JWT токен
    """
    # Проверяем, не существует ли уже пользователь с таким ФИО
    existing_user = db.query(User).filter(
        User.first_name == user_data.first_name,
        User.last_name == user_data.last_name,
        User.middle_name == user_data.middle_name
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким ФИО уже существует"
        )
    
    # Создаем нового пользователя
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        middle_name=user_data.middle_name,
        faculty=user_data.faculty,
        course=user_data.course,
        password_hash=hashed_password,
        completed_tests=[]
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Создаем JWT токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "full_name": db_user.full_name},
        expires_delta=access_token_expires
    )
    
    # Устанавливаем httpOnly cookie с токеном
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=get_token_expire_time(),
        secure=False,  # В продакшене должно быть True для HTTPS
        samesite="lax"
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=get_token_expire_time()
    )

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Авторизация пользователя
    
    Проверяет ФИО и пароль, возвращает JWT токен
    """
    print("[DEBUG TEMPORARY LOG] login(): вход в функцию, user_credentials =", {
        "first_name": user_credentials.first_name,
        "last_name": user_credentials.last_name, 
        "middle_name": user_credentials.middle_name,
        "faculty": user_credentials.faculty,
        "course": user_credentials.course,
        "password": "***"  # Не логируем пароль полностью
    })
    
    try:
    # Аутентифицируем пользователя
        print("[DEBUG TEMPORARY LOG] login(): вызываем authenticate_user")
    user = authenticate_user(
        db,
        user_credentials.first_name,
        user_credentials.last_name,
        user_credentials.middle_name,
        user_credentials.faculty,
        user_credentials.course,
        user_credentials.password
    )
    
        print("[DEBUG TEMPORARY LOG] login(): результат authenticate_user =", user)
    
    if not user:
            print("[DEBUG TEMPORARY LOG] login(): пользователь не найден, создаём HTTPException")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное ФИО или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем JWT токен
        print("[DEBUG TEMPORARY LOG] login(): создаём access_token_expires")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        print("[DEBUG TEMPORARY LOG] login(): access_token_expires =", access_token_expires)
        
        print("[DEBUG TEMPORARY LOG] login(): вызываем create_access_token")
    access_token = create_access_token(
        data={"sub": str(user.id), "full_name": user.full_name},
        expires_delta=access_token_expires
    )
        print("[DEBUG TEMPORARY LOG] login(): access_token создан, длина =", len(access_token) if access_token else "None")
    
    # Устанавливаем httpOnly cookie с токеном
    cookie_value = f"Bearer {access_token}"
        print("[DEBUG TEMPORARY LOG] login(): cookie_value подготовлен, длина =", len(cookie_value))
        
        print("[DEBUG TEMPORARY LOG] login(): вызываем get_token_expire_time")
        expire_time = get_token_expire_time()
        print("[DEBUG TEMPORARY LOG] login(): expire_time =", expire_time)
    
        print("[DEBUG TEMPORARY LOG] login(): устанавливаем cookie")
    response.set_cookie(
        key="access_token",
        value=cookie_value,
        httponly=True,
            max_age=expire_time,
        secure=False,  # В продакшене должно быть True для HTTPS
        samesite="lax"
    )
    
        print("[DEBUG TEMPORARY LOG] login(): создаём Token response")
        token_response = Token(
        access_token=access_token,
        token_type="bearer",
            expires_in=expire_time
        )
        print("[DEBUG TEMPORARY LOG] login(): возвращаем token_response =", token_response)
        
        return token_response
        
    except HTTPException as e:
        print("[DEBUG TEMPORARY LOG] login(): HTTPException возникло =", {
            "status_code": e.status_code,
            "detail": e.detail
        })
        raise e
    except Exception as e:
        print("[DEBUG TEMPORARY LOG] login(): неожиданное исключение =", {
            "type": type(e).__name__,
            "message": str(e)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
    )

@router.post("/logout")
async def logout(response: Response):
    """
    Выход из системы
    
    Удаляет httpOnly cookie с токеном
    """
    response.delete_cookie(key="access_token")
    return {"message": "Успешный выход из системы"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Получение информации о текущем пользователе
    
    Защищенный эндпоинт, требует авторизации
    """
    return current_user 