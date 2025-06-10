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
    print("[DEBUG TEMPORARY LOG] create_access_token(): вход в функцию, аргументы =", {
        "data": data,
        "expires_delta": expires_delta
    })
    
    try:
        to_encode = data.copy()
        print("[DEBUG TEMPORARY LOG] create_access_token(): to_encode скопировано =", to_encode)
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        print("[DEBUG TEMPORARY LOG] create_access_token(): время истечения =", expire)
        
        to_encode.update({"exp": expire})
        print("[DEBUG TEMPORARY LOG] create_access_token(): to_encode с exp =", to_encode)
        
        print("[DEBUG TEMPORARY LOG] create_access_token(): вызываем jwt.encode")
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        print("[DEBUG TEMPORARY LOG] create_access_token(): токен создан, длина =", len(encoded_jwt))
        
        return encoded_jwt
        
    except Exception as e:
        print("[DEBUG TEMPORARY LOG] create_access_token(): исключение =", {
            "type": type(e).__name__,
            "message": str(e)
        })
        raise e

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
    
    try:
        print("[DEBUG TEMPORARY LOG] authenticate_user(): выполняем запрос к БД")
        user = db.query(User).filter(
            User.first_name == first_name,
            User.last_name == last_name,
            User.middle_name == middle_name,
            User.faculty == faculty,
            User.course == course
        ).first()
        
        print("[DEBUG TEMPORARY LOG] authenticate_user(): результат запроса к БД =", {
            "user_found": user is not None,
            "user_id": user.id if user else None,
            "user_full_name": user.full_name if user else None
        })
        
        if not user:
            print("[DEBUG TEMPORARY LOG] authenticate_user(): пользователь не найден в БД")
            return None
        
        print("[DEBUG TEMPORARY LOG] authenticate_user(): вызываем verify_password")
        password_valid = verify_password(password, user.password_hash)
        print("[DEBUG TEMPORARY LOG] authenticate_user(): результат verify_password =", password_valid)
        
        if not password_valid:
            print("[DEBUG TEMPORARY LOG] authenticate_user(): неверный пароль")
            return None
        
        print("[DEBUG TEMPORARY LOG] authenticate_user(): аутентификация успешна, возвращаем пользователя")
        return user
        
    except Exception as e:
        print("[DEBUG TEMPORARY LOG] authenticate_user(): исключение =", {
            "type": type(e).__name__,
            "message": str(e)
        })
        return None

def get_token_from_request(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
    """
    Извлекает токен из запроса (заголовок Authorization или cookie)
    
    Args:
        request: HTTP запрос
        credentials: Данные авторизации из заголовка
        
    Returns:
        str или None: JWT токен
    """
    # Сначала пытаемся получить токен из заголовка Authorization
    if credentials and credentials.credentials:
        return credentials.credentials
    
    # Если нет в заголовке, пытаемся получить из httpOnly cookie
    token = request.cookies.get("access_token")
    if token:
        # Убираем префикс "Bearer " если он есть
        if token.startswith("Bearer "):
            token = token[7:]
        return token
    
    return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Получает текущего пользователя из JWT токена
    
    Args:
        request: HTTP запрос
        credentials: Данные авторизации
        db: Сессия базы данных
        
    Returns:
        User: Текущий пользователь
        
    Raises:
        HTTPException: Если токен недействителен или пользователь не найден
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Получаем токен из запроса
    token = get_token_from_request(request, credentials)
    
    if not token:
        raise credentials_exception
    
    try:
        # Декодируем JWT токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        
        if user_id_str is None:
            raise credentials_exception
            
        # Преобразуем строку в int
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id)
        
    except JWTError:
        raise credentials_exception
    
    # Получаем пользователя из базы данных
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    if user is None:
        raise credentials_exception
    
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