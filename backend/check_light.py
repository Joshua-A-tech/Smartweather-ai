import requests
import os
from dotenv import load_dotenv
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

response = requests.get(f'{url}/rest/v1/weather_data?select=device_id,temperature,light,created_at&order=created_at.desc&limit=5', headers=headers)
data = response.json()
print('Checking light data in Supabase:')
for record in data:
    print(f"  - Temp: {record.get('temperature')}°C | Light: {record.get('light')} | {record.get('created_at')}")
