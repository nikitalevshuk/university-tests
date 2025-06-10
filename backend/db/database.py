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
    db = SessionLocal()
    
    try:
        yield db
    except Exception as e:
        raise e
    finally:
        db.close()

# Функция для создания всех таблиц (используется в разработке)
def create_tables():
    """
    Создает все таблицы в базе данных.
    В продакшене используйте Alembic миграции.
    """
    Base.metadata.create_all(bind=engine) 