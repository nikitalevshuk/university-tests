"""
Обработчики исключений для FastAPI приложения
"""

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from jose import JWTError

def create_exception_handlers(app: FastAPI):
    """
    Создает и регистрирует обработчики исключений для FastAPI приложения
    
    Args:
        app: Экземпляр FastAPI приложения
    """
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Обработчик HTTP исключений"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.detail,
                "status_code": exc.status_code
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Обработчик ошибок валидации Pydantic"""
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            message = error["msg"]
            errors.append(f"{field}: {message}")
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": True,
                "message": "Ошибка валидации данных",
                "details": errors,
                "status_code": 422
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """Обработчик ошибок SQLAlchemy"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": True,
                "message": "Ошибка базы данных",
                "status_code": 500
            }
        )
    
    @app.exception_handler(JWTError)
    async def jwt_exception_handler(request: Request, exc: JWTError):
        """Обработчик ошибок JWT"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": True,
                "message": "Недействительный токен авторизации",
                "status_code": 401
            }
        )
    
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """Обработчик ошибок значений"""
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": True,
                "message": str(exc),
                "status_code": 400
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Общий обработчик исключений"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": True,
                "message": "Внутренняя ошибка сервера",
                "status_code": 500
            }
        ) 