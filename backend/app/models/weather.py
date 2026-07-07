"""
Weather data models for Supabase/PostgreSQL
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, DateTime, Integer, Boolean, Index
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class WeatherData(Base):
    """SQLAlchemy model for weather data"""
    __tablename__ = "weather_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    light_intensity = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)
    signal_strength = Column(Integer, nullable=True)
    is_anomaly = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_device_timestamp', 'device_id', 'created_at'),
    )

class WeatherDataCreate(BaseModel):
    """Pydantic model for creating weather data"""
    device_id: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    rainfall: Optional[float] = None
    light_intensity: Optional[float] = None
    battery_voltage: Optional[float] = None
    signal_strength: Optional[int] = None

class WeatherDataResponse(BaseModel):
    """Pydantic model for weather data response"""
    id: str
    device_id: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    rainfall: Optional[float] = None
    light_intensity: Optional[float] = None
    battery_voltage: Optional[float] = None
    signal_strength: Optional[int] = None
    is_anomaly: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
