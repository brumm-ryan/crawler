from typing import Optional, List
from sqlmodel import Field, Relationship
from app.models.base import BaseModel
from app.models.users import User

# DB Models
class Address(BaseModel, table=True):
    """Address model for storing address information."""
    id: Optional[int] = Field(default=None, primary_key=True)
    street: str
    city: str
    state: str
    zip_code: str
    datasheet_id: Optional[int] = Field(default=None, foreign_key="datasheet.id")
    datasheet: Optional["Datasheet"] = Relationship(back_populates="addresses")

class Phone(BaseModel, table=True):
    """Phone model for storing phone information."""
    id: Optional[int] = Field(default=None, primary_key=True)
    number: str
    type: Optional[str] = None  # e.g., mobile, home, work
    datasheet_id: Optional[int] = Field(default=None, foreign_key="datasheet.id")
    datasheet: Optional["Datasheet"] = Relationship(back_populates="phones")

class Email(BaseModel, table=True):
    """Email model for storing email information."""
    id: Optional[int] = Field(default=None, primary_key=True)
    address: str
    type: Optional[str] = None  # e.g., personal, work
    datasheet_id: Optional[int] = Field(default=None, foreign_key="datasheet.id")
    datasheet: Optional["Datasheet"] = Relationship(back_populates="emails")

class Datasheet(BaseModel, table=True):
    """Datasheet model for storing person information with relationships to addresses, phones, and emails."""
    id: Optional[int] = Field(default=None, primary_key=True)
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    age: int

    # User relationship
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship()

    # Relationships
    addresses: List[Address] = Relationship(back_populates="datasheet")
    phones: List[Phone] = Relationship(back_populates="datasheet")
    emails: List[Email] = Relationship(back_populates="datasheet")

# Pydantic models for API requests/responses
class AddressCreate(BaseModel):
    """Model for creating a new address."""
    street: str
    city: str
    state: str
    zip_code: str

class AddressRead(BaseModel):
    """Model for reading address information."""
    id: int
    street: str
    city: str
    state: str
    zip_code: str

class PhoneCreate(BaseModel):
    """Model for creating a new phone."""
    number: str
    type: Optional[str] = None

class PhoneRead(BaseModel):
    """Model for reading phone information."""
    id: int
    number: str
    type: Optional[str] = None

class EmailCreate(BaseModel):
    """Model for creating a new email."""
    address: str
    type: Optional[str] = None

class EmailRead(BaseModel):
    """Model for reading email information."""
    id: int
    address: str
    type: Optional[str] = None

class DatasheetCreate(BaseModel):
    """Model for creating a new datasheet."""
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    age: int
    user_id: Optional[int] = None
    addresses: Optional[List[AddressCreate]] = None
    phones: Optional[List[PhoneCreate]] = None
    emails: Optional[List[EmailCreate]] = None

class DatasheetRead(BaseModel):
    """Model for reading datasheet information."""
    id: int
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    age: int
    user_id: Optional[int] = None
    addresses: List[AddressRead] = []
    phones: List[PhoneRead] = []
    emails: List[EmailRead] = []
