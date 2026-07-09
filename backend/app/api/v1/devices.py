"""
Devices API endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def get_supabase_data(table: str, filters: dict = None):
    """Fetch data from Supabase"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f'{url}/rest/v1/{table}?select=*',
            headers=headers
        )
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

@router.get("/devices")
async def get_devices():
    """Get all registered devices"""
    devices = get_supabase_data('devices')
    
    # Get latest weather for each device
    for device in devices:
        device_id = device.get('device_id')
        weather = get_supabase_data(f'weather_data?device_id=eq.{device_id}&order=created_at.desc&limit=1')
        if weather:
            device['latest_reading'] = weather[0]
        else:
            device['latest_reading'] = None
    
    return {
        "status": "success",
        "devices": devices,
        "count": len(devices)
    }

@router.get("/devices/{device_id}/weather")
async def get_device_weather(
    device_id: str,
    limit: int = 100
):
    """Get weather data for a specific device"""
    weather = get_supabase_data(f'weather_data?device_id=eq.{device_id}&order=created_at.desc&limit={limit}')
    
    return {
        "status": "success",
        "device_id": device_id,
        "data": weather,
        "count": len(weather)
    }
