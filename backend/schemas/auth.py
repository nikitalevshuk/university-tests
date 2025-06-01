from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """Схема для JWT токена"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # время жизни токена в секундах

class TokenData(BaseModel):
    """Схема для данных токена"""
    user_id: Optional[int] = None
    full_name: Optional[str] = None 