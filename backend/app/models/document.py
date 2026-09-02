from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String, index=True)
    stored_file_path = Column(String)
    mime_type = Column(String)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    current_status = Column(String, default="uploaded")
    
    jobs = relationship("Job", back_populates="document", cascade="all, delete")
    result = relationship("Result", back_populates="document", uselist=False, cascade="all, delete")