from app import db
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(80), unique=True, nullable=False)
    password = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    # Relationship to HistoryItem
    history_items = relationship('HistoryItem', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'
