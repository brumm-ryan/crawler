from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, Relationship
from app.models.base import BaseModel
from app.models.datasheets import Datasheet

if TYPE_CHECKING:
    from app.models.scan_results import ScanResult

# DB Models
class Scan(BaseModel, table=True):
    """Scan model for storing scan information."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    status: str = Field(default="pending")  # pending, in_progress, completed, failed
    workflow_id: Optional[str] = Field(nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    # Relationship with Datasheet (optional)
    datasheet_id: Optional[int] = Field(default=None, foreign_key="datasheet.id")
    datasheet: Optional[Datasheet] = Relationship()
    
    # Relationship with ScanResults
    results: List["ScanResult"] = Relationship(back_populates="scan")

# Pydantic models for API requests/responses
class ScanCreate(BaseModel):
    """Model for creating a new scan."""
    name: str
    description: Optional[str] = None
    datasheet_id: Optional[int] = None

class ScanUpdate(BaseModel):
    """Model for updating a scan."""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ScanRead(BaseModel):
    """Model for reading scan information."""
    id: int
    name: str
    description: Optional[str] = None
    status: str
    workflow_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    datasheet_id: Optional[int] = None