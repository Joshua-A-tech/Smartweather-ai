"""
Application configuration
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
import os

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "SmartWeather"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/smartweather")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # MQTT
    HIVEMQ_HOST: str = os.getenv("HIVEMQ_HOST", "localhost")
    HIVEMQ_PORT: int = int(os.getenv("HIVEMQ_PORT", "1883"))
    HIVEMQ_USERNAME: Optional[str] = os.getenv("HIVEMQ_USERNAME")
    HIVEMQ_PASSWORD: Optional[str] = os.getenv("HIVEMQ_PASSWORD")
    MQTT_TOPIC: str = "weather/sensors/#"
    
    # AI/ML
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    HUGGINGFACE_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_TOKEN")
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")  # Added this line
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
