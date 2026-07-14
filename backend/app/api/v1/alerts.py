"""
Alert API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database.supabase import get_supabase_client
from app.services.alerts.email_alerts import email_alerts
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AlertPreferences(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    device_location: Optional[str] = None
    temp_high: Optional[float] = None
    temp_low: Optional[float] = None
    humidity_high: Optional[float] = None
    rain_alert: bool = False

@router.get("/preferences")
async def get_preferences(
    user_id: str = Query(..., description="User ID"),
    device_id: str = Query(..., description="Device ID")
):
    """Get user alert preferences"""
    try:
        logger.info(f"Getting preferences for user {user_id}, device {device_id}")
        supabase = get_supabase_client()
        response = supabase.table('alert_preferences')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('device_id', device_id)\
            .execute()
        
        logger.info(f"Found {len(response.data)} preferences")
        return {"status": "success", "data": response.data}
    except Exception as e:
        logger.error(f"Error fetching preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preferences")
async def create_or_update_preferences(
    prefs: AlertPreferences,
    user_id: str = Query(..., description="User ID")
):
    """Create or update alert preferences"""
    try:
        logger.info(f"Saving preferences for user {user_id}, device {prefs.device_id}")
        logger.info(f"Data: {prefs.dict()}")
        
        supabase = get_supabase_client()
        
        # Check if exists
        existing = supabase.table('alert_preferences')\
            .select('id')\
            .eq('user_id', user_id)\
            .eq('device_id', prefs.device_id)\
            .execute()
        
        data = prefs.dict()
        data['user_id'] = user_id
        data['updated_at'] = datetime.now().isoformat()
        
        if existing.data:
            # Update
            logger.info("Updating existing preferences")
            response = supabase.table('alert_preferences')\
                .update(data)\
                .eq('user_id', user_id)\
                .eq('device_id', prefs.device_id)\
                .execute()
        else:
            # Insert
            logger.info("Creating new preferences")
            data['created_at'] = datetime.now().isoformat()
            response = supabase.table('alert_preferences')\
                .insert(data)\
                .execute()
        
        logger.info(f"Preferences saved successfully")
        return {"status": "success", "data": response.data}
    except Exception as e:
        logger.error(f"Error saving preferences: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_alert_logs(
    device_id: str = Query(..., description="Device ID"),
    limit: int = Query(50, ge=1, le=100)
):
    """Get alert logs for a device"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('alert_logs')\
            .select('*')\
            .eq('device_id', device_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        logger.error(f"Error fetching logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check")
async def check_alerts(
    device_id: str = Query(..., description="Device ID"),
    user_id: str = Query(..., description="User ID")
):
    """Manually check for alerts"""
    try:
        logger.info(f"Checking alerts for device {device_id}, user {user_id}")
        
        # Get latest weather data
        supabase = get_supabase_client()
        weather_response = supabase.table('weather_data')\
            .select('*')\
            .eq('device_id', device_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if not weather_response.data:
            return {
                "status": "success",
                "alerts_sent": 0,
                "message": "No weather data available"
            }
        
        # Process alerts
        sent = email_alerts.process_alerts(
            device_id,
            weather_response.data[0],
            user_id
        )
        
        logger.info(f"Alerts sent: {sent}")
        
        return {
            "status": "success",
            "alerts_sent": sent,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error checking alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
