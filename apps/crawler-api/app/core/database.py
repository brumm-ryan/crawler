import os
from sqlmodel import SQLModel, create_engine, Session

# Import all models to ensure they're included in SQLModel.metadata
from app.models.users import User
from app.models.datasheets import Datasheet
from app.models.scans import Scan
from app.models.scan_results import ScanResult

# Database URL - using MySQL with environment variable fallback to SQLite for local development
DATABASE_URL = os.environ.get("DATABASE_URL")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    connect_args={} if DATABASE_URL.startswith("mysql") else {"check_same_thread": False}  # Only needed for SQLite
)

def create_db_and_tables():
    """Create database tables from SQLModel models."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get a database session."""
    with Session(engine) as session:
        yield session
