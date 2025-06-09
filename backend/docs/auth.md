# Модуль аутентификации Backend

## Обзор

Модуль отвечает за аутентификацию и авторизацию пользователей в системе.

**Расположение:** `backend/auth/`

**Технологии:**
- JWT (JSON Web Tokens) для токенов доступа
- Passlib с bcrypt для хеширования паролей
- python-jose для работы с JWT

## Структура модуля

### Файлы

#### `auth.py`
**Описание:** Основной модуль с функциями аутентификации и авторизации.

#### `__init__.py`
**Описание:** Инициализация модуля с экспортом основных функций.

---

## Основные функции

### Хеширование паролей

#### `get_password_hash(password: str) -> str`
Создает хеш пароля с использованием bcrypt.

**Параметры:**
- `password` (str) - исходный пароль

**Возвращает:** str - хеш пароля

**Пример:**
```python
from auth.auth import get_password_hash

password_hash = get_password_hash("my_secure_password")
print(password_hash)  # $2b$12$...
```

#### `verify_password(plain_password: str, hashed_password: str) -> bool`
Проверяет соответствие пароля его хешу.

**Параметры:**
- `plain_password` (str) - исходный пароль
- `hashed_password` (str) - хеш пароля

**Возвращает:** bool - True если пароль верный

**Пример:**
```python
from auth.auth import verify_password

is_valid = verify_password("my_password", stored_hash)
if is_valid:
    print("Пароль верный")
```

---

### JWT токены

#### `create_access_token(data: dict, expires_delta: timedelta = None) -> str`
Создает JWT токен доступа.

**Параметры:**
- `data` (dict) - данные для включения в токен
- `expires_delta` (timedelta, optional) - время жизни токена

**Возвращает:** str - JWT токен

**Структура данных в токене:**
```python
{
    "sub": "user_id",           # ID пользователя
    "full_name": "Иван Иванов", # Полное имя
    "exp": 1640995200,          # Время истечения
    "iat": 1640991600           # Время создания
}
```

**Пример:**
```python
from datetime import timedelta
from auth.auth import create_access_token

token_data = {
    "sub": str(user.id),
    "full_name": user.full_name
}

token = create_access_token(
    data=token_data,
    expires_delta=timedelta(minutes=30)
)
```

#### `decode_access_token(token: str) -> dict`
Декодирует и валидирует JWT токен.

**Параметры:**
- `token` (str) - JWT токен

**Возвращает:** dict - данные из токена

**Исключения:**
- `JWTError` - при некорректном токене
- `ExpiredSignatureError` - при истекшем токене

**Пример:**
```python
from auth.auth import decode_access_token
from jose import JWTError

try:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
except JWTError:
    print("Некорректный токен")
```

---

### Аутентификация пользователей

#### `authenticate_user(db: Session, first_name: str, last_name: str, middle_name: str, faculty: str, course: int, password: str) -> User | None`
Аутентифицирует пользователя по ФИО, факультету, курсу и паролю.

**Параметры:**
- `db` (Session) - сессия базы данных
- `first_name` (str) - имя
- `last_name` (str) - фамилия  
- `middle_name` (str) - отчество
- `faculty` (str) - факультет
- `course` (int) - курс
- `password` (str) - пароль

**Возвращает:** User | None - объект пользователя или None

**Логика работы:**
1. Поиск пользователя по ФИО, факультету и курсу
2. Проверка пароля
3. Возврат пользователя или None

**Пример:**
```python
from auth.auth import authenticate_user

user = authenticate_user(
    db=db,
    first_name="Иван",
    last_name="Иванов",
    middle_name="Иванович", 
    faculty="ФИБ",
    course=1,
    password="user_password"
)

if user:
    print(f"Пользователь {user.full_name} аутентифицирован")
else:
    print("Неверные учетные данные")
```

---

### Dependency Injection

#### `get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User`
FastAPI dependency для получения текущего пользователя из JWT токена.

**Параметры:**
- `token` (str) - JWT токен из заголовка Authorization
- `db` (Session) - сессия базы данных

**Возвращает:** User - объект текущего пользователя

**Исключения:**
- `HTTPException(401)` - при некорректном токене

**Использование в роутерах:**
```python
from fastapi import Depends
from auth.auth import get_current_user

@router.get("/protected")
async def protected_endpoint(
    current_user: User = Depends(get_current_user)
):
    return {"message": f"Привет, {current_user.full_name}!"}
```

#### `get_current_active_user(current_user: User = Depends(get_current_user)) -> User`
Dependency для получения активного пользователя.

**Описание:** В текущей реализации просто возвращает пользователя, но может быть расширен для проверки статуса активности.

---

## Конфигурация

### Переменные окружения

**Файл:** `backend/.env`

```bash
# JWT настройки
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Константы

```python
# Алгоритм подписи JWT
ALGORITHM = "HS256"

# Время жизни токена по умолчанию (минуты)
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Секретный ключ для подписи JWT
SECRET_KEY = os.getenv("SECRET_KEY")
```

### Генерация SECRET_KEY

```bash
# Генерация безопасного ключа
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## OAuth2 схема

### Настройка

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login",  # URL для получения токена
    scheme_name="JWT"
)
```

### Поддерживаемые методы авторизации

#### 1. Authorization Header
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. HTTP-only Cookies
```http
Cookie: access_token=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Безопасность

### Хеширование паролей

**Алгоритм:** bcrypt с автоматической солью

**Настройки:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto"
)
```

**Преимущества bcrypt:**
- Адаптивная функция (можно увеличивать сложность)
- Встроенная соль
- Устойчивость к rainbow table атакам

### JWT токены

**Алгоритм подписи:** HS256 (HMAC with SHA-256)

**Структура токена:**
```
Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "user_id", "exp": timestamp, ...}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Безопасность:**
- Подпись предотвращает подделку токенов
- Время истечения ограничивает время жизни
- Секретный ключ должен быть надежно защищен

### Рекомендации по безопасности

#### 1. Секретный ключ
- Используйте криптографически стойкий ключ (минимум 256 бит)
- Храните в переменных окружения
- Регулярно меняйте ключ

#### 2. Время жизни токенов
- Используйте короткое время жизни (15-30 минут)
- Реализуйте refresh токены для длительных сессий
- Рассмотрите blacklist для отозванных токенов

#### 3. Передача токенов
- Используйте HTTPS в продакшене
- Рассмотрите HTTP-only cookies для веб-приложений
- Избегайте хранения токенов в localStorage

---

## Обработка ошибок

### Типы ошибок

#### Ошибки аутентификации
```python
from fastapi import HTTPException, status

# Неверные учетные данные
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Неверное ФИО или пароль",
    headers={"WWW-Authenticate": "Bearer"},
)

# Некорректный токен
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Некорректный токен",
    headers={"WWW-Authenticate": "Bearer"},
)
```

#### Ошибки валидации
```python
# Отсутствующие поля
raise HTTPException(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    detail="Все поля обязательны для заполнения"
)
```

### Логирование ошибок

```python
import logging

logger = logging.getLogger(__name__)

def authenticate_user(...):
    try:
        # Логика аутентификации
        pass
    except Exception as e:
        logger.error(f"Ошибка аутентификации: {e}")
        return None
```

---

## Тестирование

### Unit тесты

```python
import pytest
from auth.auth import get_password_hash, verify_password, create_access_token

def test_password_hashing():
    password = "test_password"
    hashed = get_password_hash(password)
    
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_token_creation():
    data = {"sub": "123", "full_name": "Test User"}
    token = create_access_token(data)
    
    assert isinstance(token, str)
    assert len(token) > 0
    
    # Декодирование и проверка
    payload = decode_access_token(token)
    assert payload["sub"] == "123"
    assert payload["full_name"] == "Test User"
```

### Integration тесты

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/auth/login", json={
        "first_name": "Иван",
        "last_name": "Иванов",
        "middle_name": "Иванович",
        "faculty": "ФИБ",
        "course": 1,
        "password": "correct_password"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_endpoint():
    # Получение токена
    login_response = client.post("/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Использование токена
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    
    assert response.status_code == 200
    user_data = response.json()
    assert "full_name" in user_data
```

---

## Расширения и улучшения

### Refresh токены

```python
def create_refresh_token(user_id: str) -> str:
    """Создает refresh токен с длительным временем жизни"""
    data = {
        "sub": user_id,
        "type": "refresh"
    }
    return create_access_token(
        data=data, 
        expires_delta=timedelta(days=30)
    )

def refresh_access_token(refresh_token: str) -> str:
    """Обновляет access токен используя refresh токен"""
    try:
        payload = decode_access_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Некорректный refresh токен")
        
        user_id = payload.get("sub")
        # Создание нового access токена
        new_token_data = {"sub": user_id}
        return create_access_token(new_token_data)
    except JWTError:
        raise HTTPException(401, "Некорректный refresh токен")
```

### Blacklist токенов

```python
# В Redis или базе данных
blacklisted_tokens = set()

def blacklist_token(token: str):
    """Добавляет токен в черный список"""
    blacklisted_tokens.add(token)

def is_token_blacklisted(token: str) -> bool:
    """Проверяет, находится ли токен в черном списке"""
    return token in blacklisted_tokens

def get_current_user_with_blacklist(token: str = Depends(oauth2_scheme)):
    """Dependency с проверкой черного списка"""
    if is_token_blacklisted(token):
        raise HTTPException(401, "Токен отозван")
    
    return get_current_user(token)
```

### Двухфакторная аутентификация

```python
import pyotp

def generate_totp_secret() -> str:
    """Генерирует секрет для TOTP"""
    return pyotp.random_base32()

def verify_totp(secret: str, token: str) -> bool:
    """Проверяет TOTP токен"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)

def authenticate_user_with_2fa(
    db: Session, 
    credentials: dict, 
    totp_token: str
) -> User | None:
    """Аутентификация с двухфакторной проверкой"""
    user = authenticate_user(db, **credentials)
    if not user:
        return None
    
    if user.totp_secret and not verify_totp(user.totp_secret, totp_token):
        return None
    
    return user
``` 