"""
SmartWeather AI - FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SmartWeather AI",
    version="0.1.0",
    description="AI-Enhanced IoT Weather Monitoring System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import API router
from app.api.v1 import api_router
app.include_router(api_router, prefix="/api/v1")

# Import MQTT service and start it
from app.services.mqtt_service import mqtt_service

@app.on_event("startup")
async def startup_event():
    """Start MQTT service on application startup"""
    logger.info("🚀 Starting SmartWeather AI Backend...")
    try:
        mqtt_service.connect()
        logger.info("✅ MQTT service started successfully")
    except Exception as e:
        logger.error(f"❌ Failed to start MQTT service: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop MQTT service on application shutdown"""
    logger.info("🛑 Shutting down SmartWeather AI Backend...")
    try:
        mqtt_service.disconnect()
        logger.info("✅ MQTT service stopped")
    except Exception as e:
        logger.error(f"❌ Error stopping MQTT service: {e}")

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "project": "SmartWeather AI",
        "version": "0.1.0",
        "services": {
            "mqtt": "connected" if mqtt_service.is_connected else "disconnected"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "services": {
            "api": "running",
            "mqtt": "connected" if mqtt_service.is_connected else "disconnected",
            "database": "checking..."
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
