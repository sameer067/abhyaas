import secrets
from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_coach, get_db
from app.models.client import Client
from app.models.coach import Coach
from app.schemas.client import ClientCreate, ClientOut, ComplianceBlock
from app.services.compliance import (
    build_timeline,
    calculate_compliance,
    calculate_streak,
    compliance_all_time,
    compliance_for_days,
    compliance_for_range,
    get_status,
)

router = APIRouter(prefix="/api/clients", tags=["clients"])


def _enrich(client: Client, frontend_url: str, from_date: Optional[date] = None, to_date: Optional[date] = None) -> ClientOut:
    checkins = client.checkins
    joined_on = client.created_at.date()

    c7 = compliance_for_days(checkins, 7, joined_on)
    c14 = compliance_for_days(checkins, 14, joined_on)
    c30 = compliance_for_days(checkins, 30, joined_on)
    call = compliance_all_time(checkins, joined_on)

    c_custom = None
    if from_date and to_date:
        raw = compliance_for_range(checkins, from_date, to_date, joined_on)
        c_custom = ComplianceBlock(**raw)

    streak = calculate_streak(checkins)
    last_checkin = max((c.date for c in checkins), default=None)
    status_val = get_status(calculate_compliance(checkins, 7, joined_on), last_checkin)
    magic_link = f"{frontend_url}/checkin/{client.id}/{client.magic_token}"

    return ClientOut(
        id=client.id,
        name=client.name,
        phone=client.phone,
        magic_token=client.magic_token,
        created_at=client.created_at,
        magic_link=magic_link,
        c7d=ComplianceBlock(**c7),
        c14d=ComplianceBlock(**c14),
        c30d=ComplianceBlock(**c30),
        c_all=ComplianceBlock(**call),
        c_custom=c_custom,
        goal=client.goal,
        weight_kg=client.weight_kg,
        height_feet=client.height_feet,
        status=status_val,
        last_checkin=last_checkin,
        streak=streak,
    )


@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
def create_client(
    body: ClientCreate,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
):
    token = secrets.token_urlsafe(32)
    client = Client(
        coach_id=coach.id,
        name=body.name,
        phone=body.phone,
        magic_token=token,
        goal=body.goal,
        weight_kg=body.weight_kg,
        height_feet=body.height_feet,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return _enrich(client, settings.FRONTEND_URL)


@router.get("", response_model=List[ClientOut])
def list_clients(
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
):
    clients = db.query(Client).filter(Client.coach_id == coach.id).all()
    return [_enrich(c, settings.FRONTEND_URL, from_date, to_date) for c in clients]


@router.get("/{client_id}", response_model=ClientOut)
def get_client(
    client_id: UUID,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
):
    client = db.query(Client).filter(Client.id == client_id, Client.coach_id == coach.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return _enrich(client, settings.FRONTEND_URL, from_date, to_date)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: UUID,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
):
    client = db.query(Client).filter(Client.id == client_id, Client.coach_id == coach.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()


@router.get("/{client_id}/timeline")
def get_client_timeline(
    client_id: UUID,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
):
    client = db.query(Client).filter(Client.id == client_id, Client.coach_id == coach.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {
        "timeline": build_timeline(client.checkins, client.created_at.date(), 30),
        "notes": [
            {"date": c.date.isoformat(), "note": c.note}
            for c in sorted(client.checkins, key=lambda x: x.date, reverse=True)
            if c.note
        ],
    }


@router.get("/{client_id}/photos")
def get_client_photos(
    client_id: UUID,
    coach: Coach = Depends(get_current_coach),
    db: Session = Depends(get_db),
):
    client = db.query(Client).filter(Client.id == client_id, Client.coach_id == coach.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return [
        {"id": str(p.id), "image_url": p.image_url, "uploaded_at": p.uploaded_at.isoformat()}
        for p in sorted(client.photos, key=lambda x: x.uploaded_at, reverse=True)
    ]
