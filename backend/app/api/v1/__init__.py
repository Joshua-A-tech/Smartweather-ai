from fastapi import APIRouter
from . import weather, mqtt, ai, devices, voice, pdf

api_router = APIRouter()

# Include routers
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(mqtt.router, prefix="/mqtt", tags=["mqtt"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["pdf"])

@api_router.get("/test")
async def test():
    return {"message": "API router is working!"}
