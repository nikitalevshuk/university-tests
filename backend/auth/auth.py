"""
Модуль аутентификации и авторизации для системы психологического тестирования.

Включает в себя:
- Создание и верификацию JWT токенов
- Хеширование и проверку паролей
- Зависимости для получения текущего пользователя
- Middleware для обработки токенов из cookies и заголовков
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import secrets
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from passlib.hash import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from schemas.auth import TokenData

# Настройка bcrypt для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Настройка JWT
SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# HTTP Bearer схема для получения токена из заголовка
security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет соответствие пароля его хешу
    
    Args:
        plain_password: Пароль в открытом виде
        hashed_password: Хешированный пароль
        
    Returns:
        bool: True если пароли совпадают
    """
    print("[DEBUG TEMPORARY LOG] verify_password(): вход в функцию, аргументы =", {
        "plain_password": "***",
        "hashed_password_length": len(hashed_password) if hashed_password else 0,
        "hashed_password_starts_with": hashed_password[:10] if hashed_password else "None"
    })
    
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print("[DEBUG TEMPORARY LOG] verify_password(): результат pwd_context.verify =", result)
        return result
    except Exception as e:
        print("[DEBUG TEMPORARY LOG] verify_password(): исключение =", {
            "type": type(e).__name__,
            "message": str(e)
        })
        return False

def get_password_hash(password: str) -> str:
    """
    Создает хеш пароля
    
    Args:
        password: Пароль в открытом виде
        
    Returns:
        str: Хешированный пароль
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создает JWT токен
    
    Args:
        data: Данные для включения в токен
        expires_delta: Время жизни токена
        
    Returns:
        str: JWT токен
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
        
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    
    return encoded_jwt


def authenticate_user(db: Session, first_name: str, last_name: str, middle_name: str, faculty, course, password: str) -> Optional[User]:
    """
    Аутентифицирует пользователя по ФИО, факультету, курсу и паролю
    
    Args:
        db: Сессия базы данных
        first_name: Имя
        last_name: Фамилия
        middle_name: Отчество
        faculty: Факультет (enum)
        course: Курс (enum)
        password: Пароль
        
    Returns:
        User или None: Пользователь если аутентификация успешна
    """
    print("[DEBUG TEMPORARY LOG] authenticate_user(): вход в функцию, аргументы =", {
        "first_name": first_name,
        "last_name": last_name,
        "middle_name": middle_name,
        "faculty": faculty,
        "course": course,
        "password": "***"
    })
    
    
    user = db.query(User).filter(
        User.first_name == first_name,
        User.last_name == last_name,
        User.middle_name == middle_name,
        User.faculty == faculty,
        User.course == course
    ).first()
        
    if not user:
            return None
        
    password_valid = verify_password(password, user.password_hash)
        
    if not password_valid:
        return None
    
    return user

def get_token_from_request(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
    """
    Извлекает токен из запроса (заголовок Authorization или cookie)
    
    Args:
        request: HTTP запрос
        credentials: Данные авторизации из заголовка
        
    Returns:
        str или None: JWT токен
    """
    print("[DEBUG TEMPORARY LOG] get_token_from_request(): поиск токена")
    print("[DEBUG TEMPORARY LOG] get_token_from_request(): request origin =", request.headers.get("origin"))
    print("[DEBUG TEMPORARY LOG] get_token_from_request(): request host =", request.headers.get("host"))
    
    # Сначала пытаемся получить токен из заголовка Authorization
    if credentials and credentials.credentials:
        print("[DEBUG TEMPORARY LOG] get_token_from_request(): токен найден в заголовке Authorization")
        return credentials.credentials
    
    # Если нет в заголовке, пытаемся получить из httpOnly cookie
    cookie_token = request.cookies.get("access_token")
    print("[DEBUG TEMPORARY LOG] get_token_from_request(): cookies =", dict(request.cookies))
    
    if cookie_token:
        print("[DEBUG TEMPORARY LOG] get_token_from_request(): токен найден в cookie")
        # Убираем префикс "Bearer " если он есть
        if cookie_token.startswith("Bearer "):
            token = cookie_token[7:]
            print("[DEBUG TEMPORARY LOG] get_token_from_request(): убран префикс Bearer")
        else:
            token = cookie_token
        return token
    
    print("[DEBUG TEMPORARY LOG] get_token_from_request(): токен не найден")
    return None

async def get_current_user(request: Request):
    print(f"[DEBUG TEMPORARY LOG] get_current_user() началась")
    
    token = None
    
    # Сначала проверяем Authorization header (для Safari)
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        print(f"[DEBUG TEMPORARY LOG] Найден токен в Authorization header: {token[:20]}...")
    
    # Если нет в header, проверяем cookies
    if not token:
        cookies = request.cookies
        print(f"[DEBUG TEMPORARY LOG] cookies = {cookies}")
        cookie_token = cookies.get("access_token")
        
        if cookie_token:
            if cookie_token.startswith("Bearer "):
                token = cookie_token[7:]  # Убираем "Bearer " из cookie
                print(f"[DEBUG TEMPORARY LOG] Найден токен в cookie (без Bearer): {token[:20]}...")
            else:
                token = cookie_token
                print(f"[DEBUG TEMPORARY LOG] Найден токен в cookie: {token[:20]}...")
    
    if not token:
        print("[DEBUG TEMPORARY LOG] Токен не найден ни в header, ни в cookies")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[DEBUG TEMPORARY LOG] Проверяем токен: {token[:20]}...")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            print("[DEBUG TEMPORARY LOG] user_id не найден в токене")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        print(f"[DEBUG TEMPORARY LOG] JWTError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Получаем пользователя из БД
    user = get_user_by_id(user_id)
    if user is None:
        print(f"[DEBUG TEMPORARY LOG] Пользователь с ID {user_id} не найден в БД")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[DEBUG TEMPORARY LOG] Пользователь найден: {user['first_name']} {user['last_name']}")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Получает текущего активного пользователя
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Активный пользователь
        
    Raises:
        HTTPException: Если пользователь неактивен
    """
    # В нашей модели нет поля is_active, поэтому просто возвращаем пользователя
    # Можно добавить дополнительные проверки при необходимости
    return current_user

def get_token_expire_time() -> int:
    """
    Возвращает время жизни токена в секундах
    
    Returns:
        int: Время жизни токена в секундах
    """
    print("[DEBUG TEMPORARY LOG] get_token_expire_time(): вход в функцию")
    print("[DEBUG TEMPORARY LOG] get_token_expire_time(): ACCESS_TOKEN_EXPIRE_MINUTES =", ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire_seconds = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    print("[DEBUG TEMPORARY LOG] get_token_expire_time(): возвращаем expire_seconds =", expire_seconds)
    
    return expire_seconds 