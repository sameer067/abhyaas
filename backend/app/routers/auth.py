from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_coach, get_db
from app.models.coach import Coach
from app.schemas.coach import CoachLogin, CoachOut, CoachProfileUpdate, CoachRegister, TokenResponse
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: CoachRegister, db: Session = Depends(get_db)):
    if db.query(Coach).filter(Coach.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    coach = Coach(name=body.name, email=body.email, password_hash=hash_password(body.password))
    db.add(coach)
    db.commit()
    db.refresh(coach)
    token = create_access_token({"sub": str(coach.id)})
    return TokenResponse(access_token=token, coach=CoachOut.model_validate(coach))


@router.post("/login", response_model=TokenResponse)
def login(body: CoachLogin, db: Session = Depends(get_db)):
    coach = db.query(Coach).filter(Coach.email == body.email).first()
    if not coach or not verify_password(body.password, coach.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(coach.id)})
    return TokenResponse(access_token=token, coach=CoachOut.model_validate(coach))


@router.get("/me", response_model=CoachOut)
def me(coach: Coach = Depends(get_current_coach)):
    return coach


@router.put("/profile", response_model=CoachOut)
def update_profile(
    body: CoachProfileUpdate,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
):
    if body.name is not None:
        coach.name = body.name
    if body.phone is not None:
        coach.phone = body.phone
    if body.broadcast_message is not None:
        coach.broadcast_message = body.broadcast_message
    db.commit()
    db.refresh(coach)
    return coach
