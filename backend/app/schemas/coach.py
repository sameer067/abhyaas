from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class CoachRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class CoachLogin(BaseModel):
    email: EmailStr
    password: str


class CoachProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    broadcast_message: Optional[str] = None


class CoachOut(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    broadcast_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    coach: CoachOut
