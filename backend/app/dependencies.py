from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.coach import Coach
from app.services.auth import decode_token

bearer = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_coach(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Coach:
    token = credentials.credentials
    payload = decode_token(token)
    coach_id = payload.get("sub")
    if not coach_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Coach not found")
    return coach
