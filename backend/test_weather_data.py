import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

# Fetch the latest weather data
response = requests.get(f'{url}/rest/v1/weather_data?select=*&limit=3', headers=headers)
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Found {len(data)} records')
    for record in data:
        print(f"  - {record.get('temperature')}°C at {record.get('created_at')}")
else:
    print(f'Error: {response.text}')
