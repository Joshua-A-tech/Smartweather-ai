"""
Weather API endpoints with real Supabase data
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def get_supabase_data(device_id: str, limit: int = 1):
    """Fetch real data from Supabase"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f'{url}/rest/v1/weather_data?select=*&device_id=eq.{device_id}&order=created_at.desc&limit={limit}',
            headers=headers
        )
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

@router.get("/current")
async def get_current_weather(device_id: Optional[str] = "ESP32-001"):
    """Get current weather from Supabase"""
    data = get_supabase_data(device_id, 1)
    
    if data and len(data) > 0:
        record = data[0]
        return {
            "status": "success",
            "data": {
                "device_id": record.get('device_id'),
                "temperature": record.get('temperature'),
                "humidity": record.get('humidity', 0),
                "pressure": record.get('pressure'),
                "rainfall": record.get('rainfall', 0),
                "is_raining": record.get('is_raining', False),
                "altitude": record.get('altitude', 0),
                "timestamp": record.get('created_at')
            }
        }
    
    return {
        "status": "warning",
        "data": {
            "device_id": device_id,
            "temperature": None,
            "humidity": None,
            "pressure": None,
            "rainfall": None,
            "is_raining": False,
            "altitude": None,
            "timestamp": None,
            "message": "No data found for this device"
        }
    }

@router.get("/history")
async def get_weather_history(
    device_id: str = Query(..., description="Device ID"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get historical weather data"""
    data = get_supabase_data(device_id, limit)
    return {
        "status": "success",
        "data": data,
        "count": len(data)
    }
