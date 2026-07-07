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

response = requests.get(f'{url}/rest/v1/weather_data?select=*&order=created_at.desc&limit=5', headers=headers)
data = response.json()
print(f'Found {len(data)} records')
for record in data:
    temp = record.get('temperature', 'N/A')
    is_raining = record.get('is_raining', 'N/A')
    created = record.get('created_at', 'N/A')
    print(f"  - {temp}°C | Rain: {is_raining} | {created}")
