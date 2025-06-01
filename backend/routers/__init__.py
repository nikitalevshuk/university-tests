from .auth import router as auth_router
from .tests import router as tests_router
from .users import router as users_router

__all__ = ["auth_router", "tests_router", "users_router"] 