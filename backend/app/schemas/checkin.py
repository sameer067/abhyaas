from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CheckInCreate(BaseModel):
    workout_done: bool
    diet_followed: bool
    note: Optional[str] = None


class CheckInOut(BaseModel):
    id: UUID
    client_id: UUID
    date: date
    workout_done: bool
    diet_followed: bool
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckInDot(BaseModel):
    date: str
    workout: Optional[bool]
    diet: Optional[bool]


class CheckInValidateResponse(BaseModel):
    client_name: str
    already_checked_in: bool
    streak: int
    coach_phone: Optional[str] = None
    broadcast_message: Optional[str] = None
    timeline: list[CheckInDot] = []


class CheckInSubmitResponse(BaseModel):
    message: str
    streak: int
    checkin: CheckInOut
