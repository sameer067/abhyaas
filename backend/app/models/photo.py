import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    image_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="photos")
