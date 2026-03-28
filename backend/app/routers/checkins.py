from datetime import date, timedelta
from uuid import UUID

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_db
from app.models.checkin import CheckIn
from app.models.client import Client
from app.models.photo import ProgressPhoto
from app.schemas.checkin import CheckInCreate, CheckInDot, CheckInOut, CheckInSubmitResponse, CheckInValidateResponse
from app.services.compliance import calculate_streak

router = APIRouter(prefix="/api/checkin", tags=["checkin"])


def _get_client_by_token(client_id: UUID, token: str, db: Session) -> Client:
    client = db.query(Client).filter(Client.id == client_id, Client.magic_token == token).first()
    if not client:
        raise HTTPException(status_code=404, detail="Invalid link")
    return client


@router.get("/{client_id}/{token}", response_model=CheckInValidateResponse)
def validate_checkin(client_id: UUID, token: str, db: Session = Depends(get_db)):
    client = _get_client_by_token(client_id, token, db)
    today = date.today()
    already = db.query(CheckIn).filter(CheckIn.client_id == client.id, CheckIn.date == today).first()
    streak = calculate_streak(client.checkins)
    coach = client.coach

    # Build 84-day activity grid (12 weeks), capped at joining date
    joined = client.created_at.date()
    grid_start = max(today - timedelta(days=83), joined)
    checkin_map = {c.date: c for c in client.checkins}
    timeline = []
    d = grid_start
    while d <= today:
        c = checkin_map.get(d)
        timeline.append(CheckInDot(
            date=d.isoformat(),
            workout=c.workout_done if c else None,
            diet=c.diet_followed if c else None,
        ))
        d += timedelta(days=1)

    return CheckInValidateResponse(
        client_name=client.name,
        already_checked_in=already is not None,
        streak=streak,
        coach_phone=coach.phone,
        broadcast_message=coach.broadcast_message,
        timeline=timeline,
    )


@router.post("/{client_id}/{token}", response_model=CheckInSubmitResponse, status_code=status.HTTP_201_CREATED)
def submit_checkin(client_id: UUID, token: str, body: CheckInCreate, db: Session = Depends(get_db)):
    client = _get_client_by_token(client_id, token, db)
    today = date.today()
    if db.query(CheckIn).filter(CheckIn.client_id == client.id, CheckIn.date == today).first():
        raise HTTPException(status_code=409, detail="Already checked in today")
    checkin = CheckIn(
        client_id=client.id,
        date=today,
        workout_done=body.workout_done,
        diet_followed=body.diet_followed,
        note=body.note,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    db.refresh(client)
    streak = calculate_streak(client.checkins)
    return CheckInSubmitResponse(
        message="Check-in submitted!",
        streak=streak,
        checkin=CheckInOut.model_validate(checkin),
    )


@router.post("/{client_id}/{token}/photo")
async def upload_photo(client_id: UUID, token: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    client = _get_client_by_token(client_id, token, db)
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    contents = await file.read()
    result = cloudinary.uploader.upload(contents, folder=f"abhyaas/{client.id}")
    photo = ProgressPhoto(client_id=client.id, image_url=result["secure_url"])
    db.add(photo)
    db.commit()
    return {"image_url": result["secure_url"]}
