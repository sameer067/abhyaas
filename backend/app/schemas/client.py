from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ComplianceBlock(BaseModel):
    overall: float
    workout: float
    diet: float


class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    goal: Optional[str] = None
    weight_kg: Optional[float] = None
    height_feet: Optional[float] = None


class ClientOut(BaseModel):
    id: UUID
    name: str
    phone: Optional[str]
    magic_token: str
    created_at: datetime
    magic_link: Optional[str] = None
    # Pre-loaded periods
    c7d: Optional[ComplianceBlock] = None
    c14d: Optional[ComplianceBlock] = None
    c30d: Optional[ComplianceBlock] = None
    c_all: Optional[ComplianceBlock] = None
    # Custom range (only when from_date/to_date provided)
    c_custom: Optional[ComplianceBlock] = None
    # Client profile
    goal: Optional[str] = None
    weight_kg: Optional[float] = None
    height_feet: Optional[float] = None
    # Status fields
    status: Optional[str] = None
    last_checkin: Optional[date] = None
    streak: Optional[int] = None

    model_config = {"from_attributes": True}
