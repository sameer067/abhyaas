from datetime import date, timedelta
from typing import List, Optional

from app.models.checkin import CheckIn


def _range_from_days(days: int, joined_on: date):
    """Return (start, actual_days) for a rolling window, capped at joining date."""
    end = date.today()
    start = max(end - timedelta(days=days - 1), joined_on)
    actual_days = (end - start).days + 1
    return start, actual_days


def _range_from_dates(from_date: date, to_date: date, joined_on: date):
    """Return (start, actual_days) for an explicit range, capped at joining date."""
    start = max(from_date, joined_on)
    end = min(to_date, date.today())
    actual_days = (end - start).days + 1
    return start, actual_days


def _overall(checkins: List[CheckIn], start: date, actual_days: int) -> float:
    if actual_days <= 0:
        return 0.0
    m = {c.date: c for c in checkins}
    ok = sum(
        1 for i in range(actual_days)
        if (c := m.get(start + timedelta(days=i))) and c.workout_done and c.diet_followed
    )
    return round(ok / actual_days * 100, 1)


def _workout(checkins: List[CheckIn], start: date, actual_days: int) -> float:
    if actual_days <= 0:
        return 0.0
    m = {c.date: c for c in checkins}
    ok = sum(
        1 for i in range(actual_days)
        if (c := m.get(start + timedelta(days=i))) and c.workout_done
    )
    return round(ok / actual_days * 100, 1)


def _diet(checkins: List[CheckIn], start: date, actual_days: int) -> float:
    if actual_days <= 0:
        return 0.0
    m = {c.date: c for c in checkins}
    ok = sum(
        1 for i in range(actual_days)
        if (c := m.get(start + timedelta(days=i))) and c.diet_followed
    )
    return round(ok / actual_days * 100, 1)


def compliance_for_days(checkins: List[CheckIn], days: int, joined_on: date) -> dict:
    start, n = _range_from_days(days, joined_on)
    return {
        "overall": _overall(checkins, start, n),
        "workout": _workout(checkins, start, n),
        "diet": _diet(checkins, start, n),
    }


def compliance_for_range(checkins: List[CheckIn], from_date: date, to_date: date, joined_on: date) -> dict:
    start, n = _range_from_dates(from_date, to_date, joined_on)
    return {
        "overall": _overall(checkins, start, n),
        "workout": _workout(checkins, start, n),
        "diet": _diet(checkins, start, n),
    }


def compliance_all_time(checkins: List[CheckIn], joined_on: date) -> dict:
    return compliance_for_range(checkins, joined_on, date.today(), joined_on)


# Keep these for dashboard status calculation
def calculate_compliance(checkins: List[CheckIn], days: int, joined_on: date) -> float:
    return compliance_for_days(checkins, days, joined_on)["overall"]


def calculate_streak(checkins: List[CheckIn]) -> int:
    if not checkins:
        return 0
    m = {c.date: c for c in checkins}
    streak = 0
    d = date.today()
    while True:
        c = m.get(d)
        if c and c.workout_done and c.diet_followed:
            streak += 1
            d -= timedelta(days=1)
        else:
            break
    return streak


def get_status(compliance_7d: float, last_checkin: Optional[date]) -> str:
    if last_checkin is None:
        return "Inactive"
    if (date.today() - last_checkin).days >= 3:
        return "Inactive"
    if compliance_7d >= 80:
        return "On Track"
    if compliance_7d >= 50:
        return "Needs Attention"
    return "At Risk"


def build_timeline(checkins: List[CheckIn], joined_on: date, days: int = 30) -> List[dict]:
    end = date.today()
    start = max(end - timedelta(days=days - 1), joined_on)
    m = {c.date: c for c in checkins}
    timeline = []
    d = start
    while d <= end:
        c = m.get(d)
        if c:
            status = "success" if c.workout_done and c.diet_followed else "partial" if c.workout_done or c.diet_followed else "fail"
        else:
            status = "missing"
        timeline.append({
            "date": d.isoformat(),
            "workout": c.workout_done if c else None,
            "diet": c.diet_followed if c else None,
            "status": status,
            "note": c.note if c else None,
        })
        d += timedelta(days=1)
    return timeline
