import requests
import os
from dotenv import load_dotenv
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Check latest 5 records
response = requests.get(f'{url}/rest/v1/weather_data?select=*&order=created_at.desc&limit=5', headers=headers)
data = response.json()
print(f'Found {len(data)} records')
for record in data:
    print(f"  - {record.get('created_at')}: {record.get('temperature')}°C | Device: {record.get('device_id')}")
