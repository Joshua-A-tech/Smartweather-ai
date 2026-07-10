"""
Groq LLM Service with Direct HTTP Client
"""

import os
import logging
import requests
from datetime import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.client = None
        self.model = "llama-3.1-8b-instant"
        
        # Supabase HTTP client
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        logger.info(f"✅ GroqService initialized")
        logger.info(f"   Supabase URL: {self.supabase_url[:30] if self.supabase_url else 'None'}...")
        logger.info(f"   Supabase Key exists: {bool(self.supabase_key)}")
        
        # Initialize Groq
        if self.api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
                logger.info(f"✅ Groq client initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"❌ Groq init failed: {e}")
                self.client = None
        else:
            logger.warning("⚠️ GROQ_API_KEY not found")
    
    def get_weather_data(self, device_id: str = "ESP32-001") -> Optional[Dict[str, Any]]:
        """Fetch latest weather data using direct HTTP request"""
        if not self.supabase_url or not self.supabase_key:
            logger.warning("⚠️ Supabase credentials not set")
            return None
        
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            # First try with device_id filter
            url = f"{self.supabase_url}/rest/v1/weather_data"
            params = {
                'device_id': f'eq.{device_id}',
                'order': 'created_at.desc',
                'limit': '1'
            }
            
            logger.info(f"🔍 Fetching weather data for {device_id}...")
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    record = data[0]
                    logger.info(f"✅ Got weather data: {record.get('temperature')}°C")
                    return record
            
            # If no data with device_id, try without filter
            logger.info("🔍 Trying without device_id filter...")
            response = requests.get(f"{self.supabase_url}/rest/v1/weather_data?order=created_at.desc&limit=1", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    record = data[0]
                    logger.info(f"✅ Got weather data (no filter): {record.get('temperature')}°C")
                    return record
            
            logger.warning("⚠️ No weather data found")
            return None
                
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return None
    
    def get_response(self, question: str, device_id: Optional[str] = "ESP32-001") -> str:
        """Get intelligent response using Groq LLM"""
        
        # Fetch weather data
        weather = self.get_weather_data(device_id)
        
        # Build context
        if weather:
            logger.info(f"🌡️ Using weather data: {weather.get('temperature')}°C")
            weather_context = f"""
Device: {weather.get('device_id', device_id)}
Temperature: {weather.get('temperature', 'N/A')}°C
Humidity: {weather.get('humidity', 'N/A')}%
Pressure: {weather.get('pressure', 'N/A')} hPa
Wind Speed: {weather.get('wind_speed', 'N/A')} km/h
Rainfall: {weather.get('rainfall', 'N/A')} mm
Updated: {weather.get('created_at', 'unknown')}
"""
        else:
            logger.warning("⚠️ No weather data available for context")
            weather_context = "No weather data available."
        
        if not self.client:
            return self._fallback_response(question, weather)
        
        try:
            system_prompt = f"""You are SmartWeather, a friendly and intelligent assistant.

CURRENT WEATHER DATA:
{weather_context}

RULES:
1. If the user asks about WEATHER - ALWAYS use the REAL data above
2. For GENERAL questions - answer from your knowledge
3. Be friendly, conversational, and use emojis
4. Today is {datetime.now().strftime('%Y-%m-%d')} at {datetime.now().strftime('%I:%M %p')}

If weather data exists, always include it when asked about weather."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=500,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ Groq error: {e}")
            return self._fallback_response(question, weather)
    
    def _fallback_response(self, question: str, weather: Optional[Dict] = None) -> str:
        """Fallback responses"""
        if weather:
            temp = weather.get('temperature', 'N/A')
            humidity = weather.get('humidity', 'N/A')
            wind = weather.get('wind_speed', 'N/A')
            rainfall = weather.get('rainfall', 'N/A')
            
            q = question.lower()
            if 'temperature' in q or 'temp' in q:
                return f"🌡️ Current Temperature: {temp}°C\n💧 Humidity: {humidity}%\n🌬️ Wind: {wind} km/h\n☔ Rainfall: {rainfall} mm"
            if 'humidity' in q:
                return f"💧 Current Humidity: {humidity}%\n🌡️ Temperature: {temp}°C"
            if 'wind' in q:
                return f"🌬️ Wind Speed: {wind} km/h"
            if 'rain' in q:
                return f"☔ Rainfall: {rainfall} mm"
            
            return f"🌤️ Weather: {temp}°C, {humidity}% humidity, Wind: {wind} km/h"
        
        return "🤖 SmartWeather - No weather data available."

groq_service = GroqService()
