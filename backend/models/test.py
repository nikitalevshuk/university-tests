from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from db.database import Base

class Test(Base):
    """
    Модель теста в системе психологического тестирования.
    
    Attributes:
        id: Уникальный идентификатор теста
        filename: Имя JSON-файла с вопросами теста
        is_available: Доступен ли тест для прохождения
        created_at: Дата и время создания теста
    """
    
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    filename = Column(
        String(255), 
        nullable=False, 
        unique=True,
        comment="Имя JSON-файла с вопросами теста"
    )
    
    is_available = Column(
        Boolean, 
        default=True, 
        nullable=False,
        comment="Доступен ли тест для прохождения"
    )
    
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="Дата и время создания теста"
    )
    
    def __repr__(self):
        return f"<Test(id={self.id}, filename='{self.filename}', available={self.is_available})>"
    
    def to_dict(self):
        """
        Преобразует объект теста в словарь для JSON сериализации
        
        Returns:
            dict: Словарь с данными теста
        """
        return {
            "id": self.id,
            "filename": self.filename,
            "is_available": self.is_available,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def get_available_tests(cls, db_session):
        """
        Получает все доступные тесты
        
        Args:
            db_session: Сессия базы данных
            
        Returns:
            list: Список доступных тестов
        """
        return db_session.query(cls).filter(cls.is_available == True).all()
    
    def disable(self):
        """Отключает тест (делает недоступным для прохождения)"""
        self.is_available = False
    
    def enable(self):
        """Включает тест (делает доступным для прохождения)"""
        self.is_available = True 