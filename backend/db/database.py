from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Загружаем переменные окружения
load_dotenv()

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Создаем движок SQLAlchemy
engine = create_engine(
    DATABASE_URL,  
    pool_pre_ping=True,  # Проверка соединения перед использованием
    pool_recycle=300,  # Переподключение каждые 5 минут
)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Dependency для получения сессии базы данных
def get_db():
    """
    Dependency для получения сессии базы данных.
    Автоматически закрывает сессию после использования.
    """
    print("[DEBUG TEMPORARY LOG] get_db(): создаём сессию БД")
    db = SessionLocal()
    print("[DEBUG TEMPORARY LOG] get_db(): сессия создана =", db)
    
    try:
        print("[DEBUG TEMPORARY LOG] get_db(): yielding сессию")
        yield db
    except Exception as e:
        print("[DEBUG TEMPORARY LOG] get_db(): исключение в сессии =", {
            "type": type(e).__name__,
            "message": str(e)
        })
        raise e
    finally:
        print("[DEBUG TEMPORARY LOG] get_db(): закрываем сессию")
        db.close()

# Функция для создания всех таблиц (используется в разработке)
def create_tables():
    """
    Создает все таблицы в базе данных.
    В продакшене используйте Alembic миграции.
    """
    Base.metadata.create_all(bind=engine) 