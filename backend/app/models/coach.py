import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    broadcast_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    clients = relationship("Client", back_populates="coach", cascade="all, delete-orphan")
