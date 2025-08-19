from typing import Optional
from sqlmodel import Field
from app.models.base import BaseModel

# DB Models
class User(BaseModel, table=True):
  """User model for storing user information."""
  id: Optional[int] = Field(default=None, primary_key=True)
  username: str = Field(index=True)
  email: str = Field(unique=True)
  full_name: Optional[str] = None
  disabled: bool = False

# Pydantic models for API requests/responses
class UserCreate(BaseModel):
    """Model for creating a new user."""
    username: str
    email: str
    full_name: Optional[str] = None

class UserRead(BaseModel):
    """Model for reading user information."""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: bool
