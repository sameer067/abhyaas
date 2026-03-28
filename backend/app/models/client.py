import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    magic_token = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    goal = Column(Text, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_feet = Column(Float, nullable=True)

    coach = relationship("Coach", back_populates="clients")
    checkins = relationship("CheckIn", back_populates="client", cascade="all, delete-orphan")
    photos = relationship("ProgressPhoto", back_populates="client", cascade="all, delete-orphan")
