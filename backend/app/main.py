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

# Setup CORS - Allow all origins for development
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

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "project": "SmartWeather AI",
        "version": "0.1.0",
        "services": {
            "mqtt": "disconnected"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "services": {
            "api": "running",
            "mqtt": "disconnected",
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
