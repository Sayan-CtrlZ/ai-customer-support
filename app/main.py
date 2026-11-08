import asyncio
import logging
import secrets
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import db
from app.config import settings
from app.poller import poll_once

logger = logging.getLogger("main")


async def background_poller() -> None:
    """Continuously poll Gmail in the background every poll_interval_seconds."""
    logger.info("Starting background inbox poller (interval: %ss)", settings.poll_interval_seconds)
    # Brief initial pause to let server finish boot
    await asyncio.sleep(2)
    while True:
        try:
            count = await asyncio.to_thread(poll_once)
            if count:
                logger.info("Background poller processed %s new message(s)", count)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.exception("Background inbox poller error: %s", e)
        await asyncio.sleep(settings.poll_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background poller automatically when the app starts
    poller_task = asyncio.create_task(background_poller())
    yield
    # Clean shutdown when the app stops
    poller_task.cancel()
    try:
        await poller_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Neem & Teak Customer Support", lifespan=lifespan)

security = HTTPBasic(auto_error=False)


def require_login(credentials: HTTPBasicCredentials | None = Depends(security)) -> None:
    valid = (
        credentials is not None
        and settings.dashboard_password != ""
        and secrets.compare_digest(credentials.username.encode(), settings.dashboard_username.encode())
        and secrets.compare_digest(credentials.password.encode(), settings.dashboard_password.encode())
    )
    if not valid:
        raise HTTPException(status_code=401, detail="Wrong username or password")


class EntryUpdate(BaseModel):
    title: str
    content: str


api = APIRouter(prefix="/api", dependencies=[Depends(require_login)])


@api.get("/login")
def login() -> dict:
    return {"ok": True}


@api.get("/events")
def events() -> list[dict]:
    return db.list_events()


@api.get("/tickets")
def tickets() -> list[dict]:
    return db.list_tickets()


@api.get("/tickets/{ticket_id}/messages")
def ticket_messages(ticket_id: int) -> list[dict]:
    return db.list_messages(ticket_id)


@api.get("/knowledge-base")
def knowledge_base() -> list[dict]:
    return db.list_knowledge_base()


@api.put("/knowledge-base/{entry_id}")
def update_entry(entry_id: int, update: EntryUpdate) -> dict:
    entry = db.update_knowledge_base_entry(entry_id, update.title, update.content)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@api.post("/poll")
def poll() -> dict:
    return {"messages": poll_once()}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(api)

# The built dashboard. Mounted last, so the API routes above take precedence.
dashboard = Path(__file__).resolve().parent.parent / "dashboard" / "dist"
if dashboard.exists():
    app.mount("/", StaticFiles(directory=dashboard, html=True), name="dashboard")
