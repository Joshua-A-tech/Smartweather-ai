import requests
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Your ESP32's real reading with humidity
real_data = {
    'device_id': 'ESP32-001',
    'device_name': 'Garden Sensor',
    'location': 'Backyard',
    'temperature': 25.6,
    'humidity': 65.0,  # Added humidity
    'pressure': 849.94,
    'altitude': 1458.0,
    'rainfall': 0,
    'is_raining': False,
    'light': 0,
    'rain_percentage': 0,
    'uptime': 0,
    'created_at': datetime.now().isoformat()
}

response = requests.post(f'{url}/rest/v1/weather_data', headers=headers, json=real_data)
if response.status_code == 201:
    print('✅ Real ESP32 data inserted!')
    print(f'   Temperature: 25.6°C')
    print(f'   Humidity: 65.0%')
    print(f'   Pressure: 849.94 hPa')
    print(f'   Rain: DRY')
    print(f'   Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
else:
    print(f'❌ Error: {response.status_code} - {response.text}')
