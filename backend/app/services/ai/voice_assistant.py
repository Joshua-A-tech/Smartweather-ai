"""
Voice Assistant Service
Processes voice commands for Alexa, Google, Siri
"""

import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.database.supabase import get_supabase_client
from app.services.ai.groq_service import groq_service

logger = logging.getLogger(__name__)

class VoiceAssistantService:
    """Service for voice assistant interactions"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def get_weather_data(self, device_id: str = "ESP32-001") -> Dict:
        """Get current weather data"""
        try:
            response = self.supabase.table('weather_data')\
                .select('*')\
                .eq('device_id', device_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            
            if response.data:
                return response.data[0]
            return {}
        except Exception as e:
            logger.error(f"Error fetching weather: {e}")
            return {}
    
    def get_forecast(self, device_id: str = "ESP32-001", hours: int = 24) -> Dict:
        """Get weather forecast"""
        try:
            response = self.supabase.table('weather_data')\
                .select('*')\
                .eq('device_id', device_id)\
                .order('created_at', desc=True)\
                .limit(hours)\
                .execute()
            
            return {"data": response.data or [], "count": len(response.data or [])}
        except Exception as e:
            logger.error(f"Error fetching forecast: {e}")
            return {"data": [], "count": 0}
    
    def process_command(self, command: str, device_id: str = "ESP32-001") -> str:
        """
        Process voice commands and return response
        """
        command_lower = command.lower()
        weather = self.get_weather_data(device_id)
        
        # Simple command parsing first
        if "temperature" in command_lower or "temp" in command_lower:
            temp = weather.get('temperature', 'unknown')
            return f"The temperature is {temp}°C"
        
        if "humidity" in command_lower or "humid" in command_lower:
            humidity = weather.get('humidity', 'unknown')
            return f"The humidity is {humidity}%"
        
        if "pressure" in command_lower:
            pressure = weather.get('pressure', 'unknown')
            return f"The pressure is {pressure} hPa"
        
        if "rain" in command_lower or "raining" in command_lower:
            is_raining = weather.get('is_raining', False)
            return "It is currently raining" if is_raining else "It is currently dry"
        
        if "forecast" in command_lower or "tomorrow" in command_lower:
            return self.get_voice_forecast(device_id)
        
        if "help" in command_lower or "what can you do" in command_lower:
            return self.get_help_text()
        
        # Use Groq for complex questions
        try:
            response = groq_service.get_response(command, device_id)
            return response
        except Exception as e:
            logger.error(f"Groq error: {e}")
            return "I'm sorry, I didn't understand that. Try asking about temperature, humidity, rain, or forecast."
    
    def get_voice_forecast(self, device_id: str) -> str:
        """Generate voice-friendly forecast response"""
        forecast = self.get_forecast(device_id, 24)
        data = forecast.get('data', [])
        
        if not data:
            return "No forecast data available."
        
        temps = [d.get('temperature', 0) for d in data if d.get('temperature')]
        if not temps:
            return "No temperature data available for forecast."
        
        avg_temp = sum(temps) / len(temps)
        max_temp = max(temps)
        min_temp = min(temps)
        
        # Check for rain
        rain_detected = any(d.get('is_raining', False) for d in data[:6])
        rain_text = "with possible rain" if rain_detected else "with no rain expected"
        
        return f"Tomorrow's forecast: average temperature {avg_temp:.1f}°C, ranging from {min_temp:.1f}°C to {max_temp:.1f}°C, {rain_text}."
    
    def get_help_text(self) -> str:
        """Return help text for voice commands"""
        return """You can ask me about:
- Temperature: "What's the temperature?"
- Humidity: "What's the humidity?"
- Pressure: "What's the pressure?"
- Rain: "Is it raining?"
- Forecast: "What's the forecast for tomorrow?"
- General: "What's the weather like?"
- Help: "What can you do?"

I can also answer general questions about the weather."""
    
    def format_for_voice(self, text: str) -> str:
        """Format text for voice output (remove markdown, emojis)"""
        # Remove markdown bold
        text = text.replace('**', '')
        # Remove markdown italic
        text = text.replace('*', '')
        # Remove emojis (simple removal)
        import re
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
            u"\U00002700-\U000027BF"  # dingbats
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        text = emoji_pattern.sub(r'', text)
        return text.strip()

voice_assistant = VoiceAssistantService()
