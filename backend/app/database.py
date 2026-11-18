import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger(__name__)

database_url = settings.DATABASE_URL
connect_args = {}

# Check for SQLite or fallback
try:
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        engine = create_engine(database_url, connect_args=connect_args)
    else:
        # Test connection to PostgreSQL; if unreachable, fallback gracefully to SQLite
        try:
            engine = create_engine(database_url, pool_pre_ping=True)
            with engine.connect() as conn:
                logger.info("Connected successfully to PostgreSQL database.")
        except Exception as pg_err:
            logger.warning(
                f"PostgreSQL connection to {database_url} failed ({pg_err}). "
                "Falling back to local SQLite storage for continuous availability."
            )
            database_url = "sqlite:///./airguard.db"
            connect_args = {"check_same_thread": False}
            engine = create_engine(database_url, connect_args=connect_args)
except Exception as e:
    logger.error(f"Error configuring database engine: {e}")
    database_url = "sqlite:///./airguard.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(database_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

