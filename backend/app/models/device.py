"""
Device models for Supabase/PostgreSQL
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Device(Base):
    """SQLAlchemy model for devices"""
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    firmware_version = Column(String, nullable=True)
    hardware_version = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_seen = Column(DateTime, nullable=True)
    device_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'device_metadata'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DeviceCreate(BaseModel):
    device_id: str
    name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None
    device_metadata: Optional[dict] = None

class DeviceResponse(BaseModel):
    id: str
    device_id: str
    name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    firmware_version: Optional[str] = None
    hardware_version: Optional[str] = None
    is_active: bool
    last_seen: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
