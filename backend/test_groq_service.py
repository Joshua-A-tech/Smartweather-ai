import os
from dotenv import load_dotenv
load_dotenv()

# Import the service
from app.services.ai.groq_service import groq_service

print("=" * 50)
print("Testing Groq Service...")
print("=" * 50)
print(f"Groq client available: {groq_service.client is not None}")
print(f"Supabase URL: {groq_service.supabase_url}")
print(f"Supabase Key exists: {bool(groq_service.supabase_key)}")

# Test weather data fetch
print("\n🔍 Fetching weather data...")
weather = groq_service.get_weather_data("ESP32-001")
print(f"Weather data found: {weather is not None}")

if weather:
    print(f"   Temperature: {weather.get('temperature')}°C")
    print(f"   Humidity: {weather.get('humidity')}%")
    print(f"   Pressure: {weather.get('pressure')} hPa")
    print(f"   Created at: {weather.get('created_at')}")
else:
    print("   No weather data found!")

# Test query
print("\n💬 Testing query...")
response = groq_service.get_response("What is the temperature today?", "ESP32-001")
print(f"\nResponse:\n{response[:300]}...")
