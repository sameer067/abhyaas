from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_coach, get_db
from app.models.client import Client
from app.models.coach import Coach
from app.services.compliance import calculate_compliance, get_status

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    clients = db.query(Client).filter(Client.coach_id == coach.id).all()
    counts = {"On Track": 0, "Needs Attention": 0, "At Risk": 0, "Inactive": 0}
    for client in clients:
        compliance_7d = calculate_compliance(client.checkins, 7, client.created_at.date())
        last_checkin = max((c.date for c in client.checkins), default=None)
        status = get_status(compliance_7d, last_checkin)
        counts[status] = counts.get(status, 0) + 1
    return {
        "total_clients": len(clients),
        "on_track": counts["On Track"],
        "needs_attention": counts["Needs Attention"],
        "at_risk": counts["At Risk"],
        "inactive": counts["Inactive"],
    }
