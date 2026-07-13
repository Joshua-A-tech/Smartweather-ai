"""
Voice Assistant API Endpoints
For Alexa, Google Assistant, Siri integration
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.services.ai.voice_assistant import voice_assistant

router = APIRouter()

class VoiceRequest(BaseModel):
    command: str
    device_id: Optional[str] = "ESP32-001"

@router.post("/voice")
async def voice_command(request: VoiceRequest):
    """Process a voice command"""
    try:
        response = voice_assistant.process_command(
            command=request.command,
            device_id=request.device_id
        )
        
        # Format for voice output
        voice_response = voice_assistant.format_for_voice(response)
        
        return {
            "status": "success",
            "command": request.command,
            "response": response,
            "voice_response": voice_response,
            "device_id": request.device_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voice/help")
async def voice_help():
    """Get help text for voice commands"""
    return {
        "status": "success",
        "help": voice_assistant.get_help_text(),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/voice/weather")
async def voice_weather(
    device_id: str = Query("ESP32-001", description="Device ID")
):
    """Get weather data for voice output"""
    try:
        weather = voice_assistant.get_weather_data(device_id)
        return {
            "status": "success",
            "device_id": device_id,
            "data": weather,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
