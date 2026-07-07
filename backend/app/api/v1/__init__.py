from fastapi import APIRouter
from . import weather, mqtt, ai

api_router = APIRouter()

# Include routers
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(mqtt.router, prefix="/mqtt", tags=["mqtt"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

@api_router.get("/test")
async def test():
    return {"message": "API router is working!"}
