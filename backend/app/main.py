from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, checkins, clients, dashboard


def _add_column_if_missing(conn, table: str, column: str, col_type: str = "TEXT"):
    from sqlalchemy import text
    result = conn.execute(text(
        f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{column}'"
    ))
    if not result.fetchone():
        conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {col_type}'))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        _add_column_if_missing(conn, "coaches", "phone", "VARCHAR")
        _add_column_if_missing(conn, "coaches", "broadcast_message", "TEXT")
        _add_column_if_missing(conn, "clients", "goal", "TEXT")
        _add_column_if_missing(conn, "clients", "weight_kg", "REAL")
        _add_column_if_missing(conn, "clients", "height_feet", "REAL")
    yield


app = FastAPI(title="Abhyaas — Coach Compliance Tracker", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(checkins.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
