from fastapi import APIRouter

from app.api.routes import users, datasheet, scans

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(datasheet.router)
api_router.include_router(scans.router)