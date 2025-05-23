from app import db
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

class HistoryItem(db.Model):
    __tablename__ = 'history_items'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    time = Column(String(80), nullable=False) # Assuming time is a string like "10:00 AM" or similar
    type = Column(String(80), nullable=False) # e.g., "web_search", "code_generation", "file_edit"
    thoughts = Column(String(500), nullable=True)
    details = Column(Text, nullable=True) # To store JSON as string
    saved_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relationship to User (already defined by backref in User model, but explicit here for clarity)
    # user = relationship('User', backref='history_items') # This line is optional if backref is in User

    def __repr__(self):
        return f'<HistoryItem {self.id} for User {self.user_id}>'
