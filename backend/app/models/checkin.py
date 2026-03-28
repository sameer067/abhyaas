import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    workout_done = Column(Boolean, nullable=False, default=False)
    diet_followed = Column(Boolean, nullable=False, default=False)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="checkins")

    __table_args__ = (UniqueConstraint("client_id", "date", name="uq_client_date"),)
