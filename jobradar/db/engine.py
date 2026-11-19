"""Database engine and session management."""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from jobradar.db.models import Base

DEFAULT_DB_URL = os.getenv("DATABASE_URL", "sqlite:///jobradar.db")

# For SQLite, ensure check_same_thread=False for multithreading
connect_args = {}
if DEFAULT_DB_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DEFAULT_DB_URL,
    connect_args=connect_args,
    echo=False,
    future=True,
)

# Enable WAL mode and foreign keys for SQLite
if DEFAULT_DB_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
    future=True,
)


def init_db(target_engine=None):
    """Create all tables in the database."""
    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def get_db():
    """Dependency for getting DB session in FastAPI and scripts."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
