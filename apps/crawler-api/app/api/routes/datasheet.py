from typing import List

from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.datasheets import (
    Datasheet, DatasheetRead, DatasheetCreate,
    Address, AddressRead, AddressCreate,
    Phone, PhoneRead, PhoneCreate,
    Email, EmailRead, EmailCreate
)

router = APIRouter()

# Datasheet CRUD operations
@router.post("/datasheets/", response_model=DatasheetRead)
def create_datasheet(datasheet: DatasheetCreate, session: Session = Depends(get_session)):
    # Extract the nested objects
    addresses_data = datasheet.addresses or []
    phones_data = datasheet.phones or []
    emails_data = datasheet.emails or []

    # Create a copy of the datasheet without the nested objects
    datasheet_dict = datasheet.dict(exclude={"addresses", "phones", "emails"})

    # Create the datasheet
    db_datasheet = Datasheet(**datasheet_dict)
    session.add(db_datasheet)
    session.commit()
    session.refresh(db_datasheet)

    # Create and associate addresses
    for address_data in addresses_data:
        db_address = Address.from_orm(address_data)
        db_address.datasheet_id = db_datasheet.id
        session.add(db_address)

    # Create and associate phones
    for phone_data in phones_data:
        db_phone = Phone.from_orm(phone_data)
        db_phone.datasheet_id = db_datasheet.id
        session.add(db_phone)

    # Create and associate emails
    for email_data in emails_data:
        db_email = Email.from_orm(email_data)
        db_email.datasheet_id = db_datasheet.id
        session.add(db_email)

    # Commit all the changes
    if addresses_data or phones_data or emails_data:
        session.commit()
        session.refresh(db_datasheet)

    return db_datasheet

@router.get("/datasheets/", response_model=List[DatasheetRead])
def read_datasheets(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    datasheets = session.exec(select(Datasheet).offset(skip).limit(limit)).all()
    return datasheets

@router.get("/datasheets/{datasheet_id}", response_model=DatasheetRead)
def read_datasheet(datasheet_id: int, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")
    return datasheet

@router.put("/datasheets/{datasheet_id}", response_model=DatasheetRead)
def update_datasheet(datasheet_id: int, datasheet_update: DatasheetCreate, session: Session = Depends(get_session)):
    db_datasheet = session.get(Datasheet, datasheet_id)
    if not db_datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    # Update datasheet attributes
    datasheet_data = datasheet_update.dict(exclude_unset=True)
    for key, value in datasheet_data.items():
        setattr(db_datasheet, key, value)

    session.add(db_datasheet)
    session.commit()
    session.refresh(db_datasheet)
    return db_datasheet

@router.delete("/datasheets/{datasheet_id}")
def delete_datasheet(datasheet_id: int, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    session.delete(datasheet)
    session.commit()
    return {"message": "Datasheet deleted successfully"}

# Address CRUD operations
@router.post("/datasheets/{datasheet_id}/addresses/", response_model=AddressRead)
def create_address(datasheet_id: int, address: AddressCreate, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    db_address = Address.from_orm(address)
    db_address.datasheet_id = datasheet_id

    session.add(db_address)
    session.commit()
    session.refresh(db_address)
    return db_address

@router.get("/datasheets/{datasheet_id}/addresses/", response_model=List[AddressRead])
def read_addresses(datasheet_id: int, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    return datasheet.addresses

@router.put("/addresses/{address_id}", response_model=AddressRead)
def update_address(address_id: int, address_update: AddressCreate, session: Session = Depends(get_session)):
    db_address = session.get(Address, address_id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Update address attributes
    address_data = address_update.dict(exclude_unset=True)
    for key, value in address_data.items():
        setattr(db_address, key, value)

    session.add(db_address)
    session.commit()
    session.refresh(db_address)
    return db_address

@router.delete("/addresses/{address_id}")
def delete_address(address_id: int, session: Session = Depends(get_session)):
    address = session.get(Address, address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    session.delete(address)
    session.commit()
    return {"message": "Address deleted successfully"}

# Phone CRUD operations
@router.post("/datasheets/{datasheet_id}/phones/", response_model=PhoneRead)
def create_phone(datasheet_id: int, phone: PhoneCreate, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    db_phone = Phone.from_orm(phone)
    db_phone.datasheet_id = datasheet_id

    session.add(db_phone)
    session.commit()
    session.refresh(db_phone)
    return db_phone

@router.get("/datasheets/{datasheet_id}/phones/", response_model=List[PhoneRead])
def read_phones(datasheet_id: int, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    return datasheet.phones

@router.put("/phones/{phone_id}", response_model=PhoneRead)
def update_phone(phone_id: int, phone_update: PhoneCreate, session: Session = Depends(get_session)):
    db_phone = session.get(Phone, phone_id)
    if not db_phone:
        raise HTTPException(status_code=404, detail="Phone not found")

    # Update phone attributes
    phone_data = phone_update.dict(exclude_unset=True)
    for key, value in phone_data.items():
        setattr(db_phone, key, value)

    session.add(db_phone)
    session.commit()
    session.refresh(db_phone)
    return db_phone

@router.delete("/phones/{phone_id}")
def delete_phone(phone_id: int, session: Session = Depends(get_session)):
    phone = session.get(Phone, phone_id)
    if not phone:
        raise HTTPException(status_code=404, detail="Phone not found")

    session.delete(phone)
    session.commit()
    return {"message": "Phone deleted successfully"}

# Email CRUD operations
@router.post("/datasheets/{datasheet_id}/emails/", response_model=EmailRead)
def create_email(datasheet_id: int, email: EmailCreate, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    db_email = Email.from_orm(email)
    db_email.datasheet_id = datasheet_id

    session.add(db_email)
    session.commit()
    session.refresh(db_email)
    return db_email

@router.get("/datasheets/{datasheet_id}/emails/", response_model=List[EmailRead])
def read_emails(datasheet_id: int, session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, datasheet_id)
    if not datasheet:
        raise HTTPException(status_code=404, detail="Datasheet not found")

    return datasheet.emails

@router.put("/emails/{email_id}", response_model=EmailRead)
def update_email(email_id: int, email_update: EmailCreate, session: Session = Depends(get_session)):
    db_email = session.get(Email, email_id)
    if not db_email:
        raise HTTPException(status_code=404, detail="Email not found")

    # Update email attributes
    email_data = email_update.dict(exclude_unset=True)
    for key, value in email_data.items():
        setattr(db_email, key, value)

    session.add(db_email)
    session.commit()
    session.refresh(db_email)
    return db_email

@router.delete("/emails/{email_id}")
def delete_email(email_id: int, session: Session = Depends(get_session)):
    email = session.get(Email, email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    session.delete(email)
    session.commit()
    return {"message": "Email deleted successfully"}

# Get datasheets by user_id
@router.get("/users/{user_id}/datasheets/", response_model=List[DatasheetRead])
def get_datasheets_by_user(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get all datasheets for a specific user."""
    query = select(Datasheet).where(Datasheet.user_id == user_id)
    datasheets = session.exec(query.offset(skip).limit(limit)).all()
    return datasheets
