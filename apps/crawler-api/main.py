import asyncio

import uvicorn
from fastapi import FastAPI

from app.core.database import create_db_and_tables
from app.api.main import api_router

app = FastAPI()
app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Hello World"}

async def start_fastapi():
    """Start the FastAPI server."""
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    await start_fastapi()

if __name__ == "__main__":
    asyncio.run(main())
